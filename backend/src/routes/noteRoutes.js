const express = require('express');
const router = express.Router();
const noteController = require('../controllers/noteController');
const authMiddleware = require('../middlewares/authMiddleware');

// Protect all routes with authentication
router.use(authMiddleware);

// Get all notes
router.get('/', noteController.getNotes);

// Search notes - must come before :id route
router.get('/search', noteController.searchNotes);

// Get a single note
router.get('/:id', noteController.getNoteById);

// Create a new note
router.post('/', noteController.createNote);

// Update a note
router.put('/:id', noteController.updateNote);

// Delete a note
router.delete('/:id', noteController.deleteNote);

module.exports = router; 