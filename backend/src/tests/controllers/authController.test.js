const { expect } = require('chai');
const sinon = require('sinon');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const User = require('../../models/User');
const authController = require('../../controllers/authController');
const { JWT_SECRET } = require('../../config/config');
const { connectDB, closeDB, clearDB } = require('../helpers/db');

describe('Auth Controller', function() {
  let sandbox;
  // Increase timeout for slow connections
  this.timeout(10000);
  
  before(async function() {
    await connectDB();
  });
  
  after(async function() {
    await closeDB();
  });
  
  beforeEach(async function() {
    sandbox = sinon.createSandbox();
    await clearDB();
  });
  
  afterEach(function() {
    sandbox.restore();
  });

  describe('register', function() {
    it('should register a new user with valid data', async function() {
      const req = {
        body: {
          name: 'Test User',
          email: 'test@example.com',
          password: 'password123'
        }
      };
      
      const res = {
        status: sinon.stub().returnsThis(),
        json: sinon.spy()
      };

      await authController.register(req, res);
      
      // Check response
      expect(res.status.calledWith(201)).to.be.true;
      expect(res.json.calledOnce).to.be.true;
      
      // Verify response contains token and user data
      const response = res.json.firstCall.args[0];
      expect(response).to.have.property('token');
      expect(response).to.have.property('user');
      expect(response.user).to.have.property('name', 'Test User');
      expect(response.user).to.have.property('email', 'test@example.com');
      
      // Verify user was saved to database
      const savedUser = await User.findOne({ email: 'test@example.com' });
      expect(savedUser).to.exist;
      expect(savedUser.name).to.equal('Test User');
      
      // Verify JWT token
      const decodedToken = jwt.verify(response.token, JWT_SECRET);
      expect(decodedToken).to.have.property('userId', savedUser._id.toString());
    });
    
    it('should return 400 when user already exists', async function() {
      // Create a user first
      await new User({
        name: 'Existing User',
        email: 'existing@example.com',
        password: 'password123'
      }).save();
      
      // Try to register the same email
      const req = {
        body: {
          name: 'Test User',
          email: 'existing@example.com',
          password: 'password123'
        }
      };
      
      const res = {
        status: sinon.stub().returnsThis(),
        json: sinon.spy()
      };

      await authController.register(req, res);
      
      // Should return 400 status
      expect(res.status.calledWith(400)).to.be.true;
      expect(res.json.calledWith(sinon.match({ message: 'User with this email already exists' }))).to.be.true;
    });
    
    it('should return 500 on server error', async function() {
      const req = {
        body: {
          name: 'Test User',
          email: 'test@example.com',
          password: 'password123'
        }
      };
      
      const res = {
        status: sinon.stub().returnsThis(),
        json: sinon.spy()
      };
      
      // Mock User.findOne to throw an error
      sandbox.stub(User, 'findOne').throws(new Error('Database error'));
      
      await authController.register(req, res);
      
      // Should return 500 status
      expect(res.status.calledWith(500)).to.be.true;
      expect(res.json.calledWith(sinon.match({ message: 'Server error' }))).to.be.true;
    });
  });
  
  describe('login', function() {
    beforeEach(async function() {
      // Create a test user for login
      const user = new User({
        name: 'Login Test User',
        email: 'login@example.com',
        password: 'password123'
      });
      await user.save();
    });
    
    it('should login user with valid credentials', async function() {
      const req = {
        body: {
          email: 'login@example.com',
          password: 'password123'
        }
      };
      
      const res = {
        status: sinon.stub().returnsThis(),
        json: sinon.spy()
      };

      await authController.login(req, res);
      
      // Check response
      expect(res.json.calledOnce).to.be.true;
      
      // Verify response contains token and user data
      const response = res.json.firstCall.args[0];
      expect(response).to.have.property('token');
      expect(response).to.have.property('user');
      expect(response.user).to.have.property('name', 'Login Test User');
      expect(response.user).to.have.property('email', 'login@example.com');
      
      // Verify JWT token
      const decodedToken = jwt.verify(response.token, JWT_SECRET);
      expect(decodedToken).to.have.property('userId');
    });
    
    it('should return 401 with invalid email', async function() {
      const req = {
        body: {
          email: 'nonexistent@example.com',
          password: 'password123'
        }
      };
      
      const res = {
        status: sinon.stub().returnsThis(),
        json: sinon.spy()
      };

      await authController.login(req, res);
      
      // Should return 401 status
      expect(res.status.calledWith(401)).to.be.true;
      expect(res.json.calledWith(sinon.match({ message: 'Invalid credentials' }))).to.be.true;
    });
    
    it('should return 401 with invalid password', async function() {
      const req = {
        body: {
          email: 'login@example.com',
          password: 'wrongpassword'
        }
      };
      
      const res = {
        status: sinon.stub().returnsThis(),
        json: sinon.spy()
      };

      await authController.login(req, res);
      
      // Should return 401 status
      expect(res.status.calledWith(401)).to.be.true;
      expect(res.json.calledWith(sinon.match({ message: 'Invalid credentials' }))).to.be.true;
    });
    
    it('should return 500 on server error', async function() {
      const req = {
        body: {
          email: 'login@example.com',
          password: 'password123'
        }
      };
      
      const res = {
        status: sinon.stub().returnsThis(),
        json: sinon.spy()
      };
      
      // Mock User.findOne to throw an error
      sandbox.stub(User, 'findOne').throws(new Error('Database error'));
      
      await authController.login(req, res);
      
      // Should return 500 status
      expect(res.status.calledWith(500)).to.be.true;
      expect(res.json.calledWith(sinon.match({ message: 'Server error' }))).to.be.true;
    });
  });
}); 