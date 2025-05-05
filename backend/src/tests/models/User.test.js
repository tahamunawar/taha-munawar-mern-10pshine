const mongoose = require('mongoose');
const { expect } = require('chai');
const User = require('../../models/User');
const { connectDB, closeDB, clearDB } = require('../helpers/db');

describe('User Model', function() {
  // Increase timeout for slow connections
  this.timeout(10000);

  before(async function() {
    await connectDB();
  });

  after(async function() {
    await closeDB();
  });

  beforeEach(async function() {
    // Clear the User collection before each test
    await clearDB();
  });

  it('should create a new user', async function() {
    const userData = {
      name: 'Test User',
      email: 'test@example.com',
      password: 'password123'
    };

    const user = new User(userData);
    const savedUser = await user.save();

    // Verify the user was saved
    expect(savedUser).to.have.property('_id');
    expect(savedUser.name).to.equal(userData.name);
    expect(savedUser.email).to.equal(userData.email);
    // Password should be hashed
    expect(savedUser.password).to.not.equal(userData.password);
  });

  it('should require name field', async function() {
    const user = new User({
      email: 'test@example.com',
      password: 'password123'
    });

    try {
      await user.save();
      // If it reaches here, validation didn't fail
      expect.fail('Validation should have failed for missing name');
    } catch (error) {
      expect(error).to.be.instanceOf(mongoose.Error.ValidationError);
      expect(error.errors.name).to.exist;
    }
  });

  it('should require email field', async function() {
    const user = new User({
      name: 'Test User',
      password: 'password123'
    });

    try {
      await user.save();
      expect.fail('Validation should have failed for missing email');
    } catch (error) {
      expect(error).to.be.instanceOf(mongoose.Error.ValidationError);
      expect(error.errors.email).to.exist;
    }
  });

  it('should require password field', async function() {
    const user = new User({
      name: 'Test User',
      email: 'test@example.com'
    });

    try {
      await user.save();
      expect.fail('Validation should have failed for missing password');
    } catch (error) {
      expect(error).to.be.instanceOf(mongoose.Error.ValidationError);
      expect(error.errors.password).to.exist;
    }
  });

  it('should hash the password before saving', async function() {
    const password = 'password123';
    const user = new User({
      name: 'Test User',
      email: 'test@example.com',
      password: password
    });

    const savedUser = await user.save();
    
    // Password should be hashed
    expect(savedUser.password).to.not.equal(password);
    // Should be a bcrypt hash
    expect(savedUser.password).to.match(/^\$2[aby]\$\d+\$/);
  });

  it('should compare password correctly', async function() {
    const password = 'password123';
    const user = new User({
      name: 'Test User',
      email: 'test@example.com',
      password: password
    });

    await user.save();
    
    // Correct password should return true
    const isMatch = await user.comparePassword(password);
    expect(isMatch).to.be.true;
    
    // Incorrect password should return false
    const isWrongMatch = await user.comparePassword('wrongpassword');
    expect(isWrongMatch).to.be.false;
  });

  it('should enforce unique email constraint', async function() {
    // Create first user
    const userData = {
      name: 'Test User',
      email: 'duplicate@example.com',
      password: 'password123'
    };

    const user1 = new User(userData);
    await user1.save();

    // Try to create another user with the same email
    const user2 = new User({
      name: 'Another User',
      email: 'duplicate@example.com', // Same email
      password: 'anotherpassword'
    });

    try {
      await user2.save();
      expect.fail('Should have failed due to duplicate email');
    } catch (error) {
      // Unique constraint violated
      expect(error).to.have.property('code', 11000); // MongoDB duplicate key error code
    }
  });

  it('should enforce minimum password length', async function() {
    const user = new User({
      name: 'Test User',
      email: 'test@example.com',
      password: 'short' // Less than 8 characters
    });

    try {
      await user.save();
      expect.fail('Validation should have failed for short password');
    } catch (error) {
      expect(error).to.be.instanceOf(mongoose.Error.ValidationError);
      expect(error.errors.password).to.exist;
    }
  });
}); 