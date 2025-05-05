const mongoose = require('mongoose');
const { expect } = require('chai');
const Note = require('../../models/Note');
const User = require('../../models/User');
const { connectDB, closeDB, clearDB } = require('../helpers/db');

describe('Note Model', function() {
  let userId;
  // Increase timeout for slow connections
  this.timeout(10000);

  before(async function() {
    await connectDB();
    
    // Create a test user first to use for the notes
    const user = new User({
      name: 'Test User',
      email: 'notetest@example.com',
      password: 'password123'
    });
    
    const savedUser = await user.save();
    userId = savedUser._id;
  });

  after(async function() {
    await closeDB();
  });

  beforeEach(async function() {
    // Clear only the Note collection before each test
    // (keep the user)
    await Note.deleteMany({});
  });

  it('should create a new note', async function() {
    const noteData = {
      title: 'Test Note',
      content: 'This is test content',
      user: userId
    };

    const note = new Note(noteData);
    const savedNote = await note.save();

    // Verify the note was saved
    expect(savedNote).to.have.property('_id');
    expect(savedNote.title).to.equal(noteData.title);
    expect(savedNote.content).to.equal(noteData.content);
    expect(savedNote.user.toString()).to.equal(userId.toString());
  });

  it('should require title field', async function() {
    const note = new Note({
      content: 'This is test content',
      user: userId
    });

    try {
      await note.save();
      expect.fail('Validation should have failed for missing title');
    } catch (error) {
      expect(error).to.be.instanceOf(mongoose.Error.ValidationError);
      expect(error.errors.title).to.exist;
    }
  });

  it('should require content field', async function() {
    const note = new Note({
      title: 'Test Note',
      user: userId
    });

    try {
      await note.save();
      expect.fail('Validation should have failed for missing content');
    } catch (error) {
      expect(error).to.be.instanceOf(mongoose.Error.ValidationError);
      expect(error.errors.content).to.exist;
    }
  });

  it('should require user field', async function() {
    const note = new Note({
      title: 'Test Note',
      content: 'This is test content'
    });

    try {
      await note.save();
      expect.fail('Validation should have failed for missing user');
    } catch (error) {
      expect(error).to.be.instanceOf(mongoose.Error.ValidationError);
      expect(error.errors.user).to.exist;
    }
  });

  it('should create timestamps', async function() {
    const note = new Note({
      title: 'Test Note',
      content: 'This is test content',
      user: userId
    });

    const savedNote = await note.save();
    
    expect(savedNote).to.have.property('createdAt');
    expect(savedNote).to.have.property('updatedAt');
    expect(savedNote.createdAt).to.be.instanceOf(Date);
    expect(savedNote.updatedAt).to.be.instanceOf(Date);
  });

  it('should update the updatedAt timestamp on modification', async function() {
    const note = new Note({
      title: 'Test Note',
      content: 'This is test content',
      user: userId
    });

    const savedNote = await note.save();
    const originalUpdatedAt = savedNote.updatedAt;
    
    // Wait a short time to ensure the timestamp would be different
    await new Promise(resolve => setTimeout(resolve, 5));
    
    // Update the note
    savedNote.title = 'Updated Test Note';
    const updatedNote = await savedNote.save();
    
    expect(updatedNote.updatedAt.getTime()).to.be.greaterThan(originalUpdatedAt.getTime());
  });

  it('should trim the title field', async function() {
    const note = new Note({
      title: '  Test Note with spaces  ',
      content: 'This is test content',
      user: userId
    });

    const savedNote = await note.save();
    expect(savedNote.title).to.equal('Test Note with spaces');
  });

  it('should have text index for search', async function() {
    // This tests that the text index was created properly
    const indexes = await Note.collection.indexes();
    const textIndex = indexes.find(index => index.name === 'title_text_content_text');
    
    expect(textIndex).to.exist;
    // In MongoDB memory server, the index may be structured differently
    expect(textIndex.key).to.have.property('_fts');
    expect(textIndex.key).to.have.property('_ftsx');
    expect(textIndex.weights).to.exist;
    expect(textIndex.weights).to.have.property('content');
    expect(textIndex.weights).to.have.property('title');
  });
}); 