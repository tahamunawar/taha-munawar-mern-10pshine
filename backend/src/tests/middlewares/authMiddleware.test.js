const { expect } = require('chai');
const sinon = require('sinon');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const User = require('../../models/User');
const authMiddleware = require('../../middlewares/authMiddleware');
const config = require('../../config/config');
const { connectDB, closeDB, clearDB } = require('../helpers/db');

describe('Auth Middleware', function() {
  let sandbox;
  let testUser;
  let validToken;
  
  // Increase timeout for slow connections
  this.timeout(10000);
  
  before(async function() {
    await connectDB();
    
    // Create a test user
    testUser = new User({
      name: 'Middleware Test User',
      email: 'middleware@example.com',
      password: 'password123'
    });
    
    await testUser.save();
    
    // Create a valid token
    validToken = jwt.sign(
      { userId: testUser._id },
      config.JWT_SECRET,
      { expiresIn: '1h' }
    );
  });
  
  after(async function() {
    await closeDB();
  });
  
  beforeEach(function() {
    sandbox = sinon.createSandbox();
  });
  
  afterEach(function() {
    sandbox.restore();
  });
  
  it('should pass with valid token', async function() {
    const req = {
      header: sinon.stub().returns(`Bearer ${validToken}`)
    };
    
    const res = {
      status: sinon.stub().returnsThis(),
      json: sinon.spy()
    };
    
    const next = sinon.spy();
    
    await authMiddleware(req, res, next);
    
    // Verify that next was called
    expect(next.calledOnce).to.be.true;
    
    // Verify that user was set in request
    expect(req.user).to.exist;
    expect(req.user.email).to.equal('middleware@example.com');
    
    // Verify response methods were not called
    expect(res.status.called).to.be.false;
    expect(res.json.called).to.be.false;
  });
  
  it('should return 401 with no token', async function() {
    const req = {
      header: sinon.stub().returns(null)
    };
    
    const res = {
      status: sinon.stub().returnsThis(),
      json: sinon.spy()
    };
    
    const next = sinon.spy();
    
    await authMiddleware(req, res, next);
    
    // Verify response
    expect(res.status.calledWith(401)).to.be.true;
    expect(res.json.calledWith(sinon.match({ message: 'No auth token, access denied' }))).to.be.true;
    
    // Verify that next was not called
    expect(next.called).to.be.false;
  });
  
  it('should return 401 with invalid token', async function() {
    const req = {
      header: sinon.stub().returns('Bearer invalidtoken')
    };
    
    const res = {
      status: sinon.stub().returnsThis(),
      json: sinon.spy()
    };
    
    const next = sinon.spy();
    
    await authMiddleware(req, res, next);
    
    // Verify response
    expect(res.status.calledWith(401)).to.be.true;
    expect(res.json.calledWith(sinon.match({ message: 'Token is not valid' }))).to.be.true;
    
    // Verify that next was not called
    expect(next.called).to.be.false;
  });
  
  it('should return 401 when user not found', async function() {
    // Create a token with a non-existent user ID
    const invalidUserId = new mongoose.Types.ObjectId();
    const invalidUserToken = jwt.sign(
      { userId: invalidUserId },
      config.JWT_SECRET,
      { expiresIn: '1h' }
    );
    
    const req = {
      header: sinon.stub().returns(`Bearer ${invalidUserToken}`)
    };
    
    const res = {
      status: sinon.stub().returnsThis(),
      json: sinon.spy()
    };
    
    const next = sinon.spy();
    
    await authMiddleware(req, res, next);
    
    // Verify response
    expect(res.status.calledWith(401)).to.be.true;
    expect(res.json.calledWith(sinon.match({ message: 'User not found' }))).to.be.true;
    
    // Verify that next was not called
    expect(next.called).to.be.false;
  });
  
  it('should handle database errors', async function() {
    const req = {
      header: sinon.stub().returns(`Bearer ${validToken}`)
    };
    
    const res = {
      status: sinon.stub().returnsThis(),
      json: sinon.spy()
    };
    
    const next = sinon.spy();
    
    // Force a database error
    sandbox.stub(User, 'findById').throws(new Error('Database error'));
    
    await authMiddleware(req, res, next);
    
    // Verify response
    expect(res.status.calledWith(401)).to.be.true;
    expect(res.json.calledWith(sinon.match({ 
      message: 'Token is not valid',
      error: sinon.match.string
    }))).to.be.true;
    
    // Verify that next was not called
    expect(next.called).to.be.false;
  });
}); 