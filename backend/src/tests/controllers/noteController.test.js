const { expect } = require('chai');
const sinon = require('sinon');
const mongoose = require('mongoose');
const Note = require('../../models/Note');
const User = require('../../models/User');
const noteController = require('../../controllers/noteController');
const { connectDB, closeDB, clearDB } = require('../helpers/db');

describe('Note Controller', function() {
  let sandbox;
  let testUser;
  let testUserId;
  
  // Increase timeout for slow connections
  this.timeout(10000);
  
  before(async function() {
    await connectDB();
    
    // Create a test user
    testUser = new User({
      name: 'Note Test User',
      email: 'notetest@example.com',
      password: 'password123'
    });
    
    await testUser.save();
    testUserId = testUser._id;
  });
  
  after(async function() {
    await closeDB();
  });
  
  beforeEach(async function() {
    sandbox = sinon.createSandbox();
    await Note.deleteMany({});
  });
  
  afterEach(function() {
    sandbox.restore();
  });

  describe('getNotes', function() {
    it('should get all notes for authenticated user', async function() {
      // Create some test notes
      const notes = [
        {
          title: 'Test Note 1',
          content: 'Content 1',
          user: testUserId
        },
        {
          title: 'Test Note 2',
          content: 'Content 2',
          user: testUserId
        }
      ];
      
      await Note.insertMany(notes);
      
      // Create a fake request
      const req = {
        user: {
          id: testUserId
        }
      };
      
      const res = {
        status: sinon.stub().returnsThis(),
        json: sinon.spy()
      };
      
      await noteController.getNotes(req, res);
      
      // Verify response
      expect(res.status.calledWith(200)).to.be.true;
      expect(res.json.calledOnce).to.be.true;
      
      const responseNotes = res.json.firstCall.args[0];
      expect(responseNotes).to.be.an('array');
      expect(responseNotes).to.have.length(2);
      expect(responseNotes[0].title).to.equal('Test Note 1');
      expect(responseNotes[1].title).to.equal('Test Note 2');
    });
    
    it('should return empty array when user has no notes', async function() {
      const req = {
        user: {
          id: testUserId
        }
      };
      
      const res = {
        status: sinon.stub().returnsThis(),
        json: sinon.spy()
      };
      
      await noteController.getNotes(req, res);
      
      // Verify response
      expect(res.status.calledWith(200)).to.be.true;
      expect(res.json.calledWith(sinon.match.array)).to.be.true;
      expect(res.json.firstCall.args[0]).to.have.length(0);
    });
    
    it('should handle errors', async function() {
      const req = {
        user: {
          id: testUserId
        }
      };
      
      const res = {
        status: sinon.stub().returnsThis(),
        json: sinon.spy()
      };
      
      // Force an error
      sandbox.stub(Note, 'find').throws(new Error('Database error'));
      
      await noteController.getNotes(req, res);
      
      // Verify error handling
      expect(res.status.calledWith(500)).to.be.true;
      expect(res.json.calledWith(sinon.match({ 
        message: 'Error fetching notes',
        error: 'Database error'
      }))).to.be.true;
    });
  });
  
  describe('getNoteById', function() {
    it('should get a note by ID', async function() {
      // Create a test note
      const note = new Note({
        title: 'Get By ID Test Note',
        content: 'Test content',
        user: testUserId
      });
      
      const savedNote = await note.save();
      
      const req = {
        params: {
          id: savedNote._id
        },
        user: {
          id: testUserId
        }
      };
      
      const res = {
        status: sinon.stub().returnsThis(),
        json: sinon.spy()
      };
      
      await noteController.getNoteById(req, res);
      
      // Verify response
      expect(res.status.calledWith(200)).to.be.true;
      expect(res.json.calledOnce).to.be.true;
      
      const responseNote = res.json.firstCall.args[0];
      expect(responseNote.title).to.equal('Get By ID Test Note');
      expect(responseNote.content).to.equal('Test content');
    });
    
    it('should return 404 for non-existent note', async function() {
      const nonExistentId = new mongoose.Types.ObjectId();
      
      const req = {
        params: {
          id: nonExistentId
        },
        user: {
          id: testUserId
        }
      };
      
      const res = {
        status: sinon.stub().returnsThis(),
        json: sinon.spy()
      };
      
      await noteController.getNoteById(req, res);
      
      // Verify response
      expect(res.status.calledWith(404)).to.be.true;
      expect(res.json.calledWith(sinon.match({ message: 'Note not found' }))).to.be.true;
    });
  });
  
  describe('createNote', function() {
    it('should create a new note with valid data', async function() {
      const req = {
        body: {
          title: 'New Test Note',
          content: 'New test content'
        },
        user: {
          id: testUserId
        }
      };
      
      const res = {
        status: sinon.stub().returnsThis(),
        json: sinon.spy()
      };
      
      await noteController.createNote(req, res);
      
      // Verify response
      expect(res.status.calledWith(201)).to.be.true;
      expect(res.json.calledOnce).to.be.true;
      
      // Check note was saved to database
      const savedNote = await Note.findOne({ title: 'New Test Note' });
      expect(savedNote).to.exist;
      expect(savedNote.content).to.equal('New test content');
      expect(savedNote.user.toString()).to.equal(testUserId.toString());
    });
    
    it('should return 400 with missing required fields', async function() {
      const req = {
        body: {
          // Missing title
          content: 'Test content'
        },
        user: {
          id: testUserId
        }
      };
      
      const res = {
        status: sinon.stub().returnsThis(),
        json: sinon.spy()
      };
      
      await noteController.createNote(req, res);
      
      // Verify response
      expect(res.status.calledWith(400)).to.be.true;
      expect(res.json.calledWith(sinon.match({ message: 'Title and content are required' }))).to.be.true;
    });
  });
  
  describe('updateNote', function() {
    let testNoteId;
    
    beforeEach(async function() {
      // Create a test note to update
      const note = new Note({
        title: 'Update Test Note',
        content: 'Original content',
        user: testUserId
      });
      
      const savedNote = await note.save();
      testNoteId = savedNote._id;
    });
    
    it('should update a note with valid data', async function() {
      const req = {
        params: {
          id: testNoteId
        },
        body: {
          title: 'Updated Test Note',
          content: 'Updated content'
        },
        user: {
          id: testUserId
        }
      };
      
      const res = {
        status: sinon.stub().returnsThis(),
        json: sinon.spy()
      };
      
      await noteController.updateNote(req, res);
      
      // Verify response
      expect(res.status.calledWith(200)).to.be.true;
      expect(res.json.calledOnce).to.be.true;
      
      // Verify database update
      const updatedNote = await Note.findById(testNoteId);
      expect(updatedNote.title).to.equal('Updated Test Note');
      expect(updatedNote.content).to.equal('Updated content');
    });
    
    it('should return 404 for non-existent note', async function() {
      const nonExistentId = new mongoose.Types.ObjectId();
      
      const req = {
        params: {
          id: nonExistentId
        },
        body: {
          title: 'Updated Title',
          content: 'Updated content'
        },
        user: {
          id: testUserId
        }
      };
      
      const res = {
        status: sinon.stub().returnsThis(),
        json: sinon.spy()
      };
      
      await noteController.updateNote(req, res);
      
      // Verify response
      expect(res.status.calledWith(404)).to.be.true;
      expect(res.json.calledWith(sinon.match({ message: 'Note not found' }))).to.be.true;
    });
    
    it('should return 400 with missing fields', async function() {
      const req = {
        params: {
          id: testNoteId
        },
        body: {
          // Both title and content missing
        },
        user: {
          id: testUserId
        }
      };
      
      const res = {
        status: sinon.stub().returnsThis(),
        json: sinon.spy()
      };
      
      await noteController.updateNote(req, res);
      
      // Verify response
      expect(res.status.calledWith(400)).to.be.true;
      expect(res.json.calledWith(sinon.match({ 
        message: 'At least one field (title or content) is required' 
      }))).to.be.true;
    });
  });
  
  describe('deleteNote', function() {
    let testNoteId;
    
    beforeEach(async function() {
      // Create a test note to delete
      const note = new Note({
        title: 'Delete Test Note',
        content: 'Test content',
        user: testUserId
      });
      
      const savedNote = await note.save();
      testNoteId = savedNote._id;
    });
    
    it('should delete a note by ID', async function() {
      const req = {
        params: {
          id: testNoteId
        },
        user: {
          id: testUserId
        }
      };
      
      const res = {
        status: sinon.stub().returnsThis(),
        json: sinon.spy()
      };
      
      await noteController.deleteNote(req, res);
      
      // Verify response
      expect(res.status.calledWith(200)).to.be.true;
      expect(res.json.calledWith(sinon.match({ message: 'Note deleted successfully' }))).to.be.true;
      
      // Verify note was deleted from database
      const deletedNote = await Note.findById(testNoteId);
      expect(deletedNote).to.be.null;
    });
    
    it('should return 404 for non-existent note', async function() {
      const nonExistentId = new mongoose.Types.ObjectId();
      
      const req = {
        params: {
          id: nonExistentId
        },
        user: {
          id: testUserId
        }
      };
      
      const res = {
        status: sinon.stub().returnsThis(),
        json: sinon.spy()
      };
      
      await noteController.deleteNote(req, res);
      
      // Verify response
      expect(res.status.calledWith(404)).to.be.true;
      expect(res.json.calledWith(sinon.match({ message: 'Note not found' }))).to.be.true;
    });
  });
}); 