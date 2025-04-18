import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import authService from '../services/authService';
import noteService, { Note, CreateNoteData, UpdateNoteData } from '../services/noteService';
import NoteList from '../components/notes/NoteList';
import NoteEditor from '../components/notes/NoteEditor';
import './Dashboard.css';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const user = authService.getUser();
  const [notes, setNotes] = useState<Note[]>([]);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isCreatingNew, setIsCreatingNew] = useState<boolean>(false);

  // Check authentication
  useEffect(() => {
    if (!authService.isAuthenticated()) {
      navigate('/login');
    }
  }, [navigate]);

  // Load notes
  useEffect(() => {
    const fetchNotes = async () => {
      setIsLoading(true);
      try {
        const fetchedNotes = await noteService.getNotes();
        setNotes(fetchedNotes);
        setError(null);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to load notes');
        console.error('Error fetching notes:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchNotes();
  }, []);

  const handleLogout = () => {
    authService.logout();
    navigate('/login');
  };

  const handleSelectNote = (note: Note) => {
    setSelectedNote(note);
    setIsCreatingNew(false);
  };

  const handleNewNote = () => {
    setSelectedNote(null);
    setIsCreatingNew(true);
  };

  const handleSaveNote = async (title: string, content: string) => {
    try {
      if (isCreatingNew) {
        // Create new note
        const newNoteData: CreateNoteData = { title, content };
        const createdNote = await noteService.createNote(newNoteData);
        setNotes(prevNotes => [createdNote, ...prevNotes]);
        setSelectedNote(createdNote);
        setIsCreatingNew(false);
      } else if (selectedNote) {
        // Update existing note
        const updateData: UpdateNoteData = { title, content };
        const updatedNote = await noteService.updateNote(selectedNote._id, updateData);
        setNotes(prevNotes =>
          prevNotes.map(note => (note._id === updatedNote._id ? updatedNote : note))
        );
        setSelectedNote(updatedNote);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save note');
      console.error('Error saving note:', err);
    }
  };

  const handleDeleteNote = async (id: string) => {
    try {
      await noteService.deleteNote(id);
      setNotes(prevNotes => prevNotes.filter(note => note._id !== id));
      
      // If the deleted note was selected, clear selection
      if (selectedNote && selectedNote._id === id) {
        setSelectedNote(null);
        setIsCreatingNew(false);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to delete note');
      console.error('Error deleting note:', err);
    }
  };

  // Handle search from the sidebar
  const handleSearch = async (query: string) => {
    if (!query.trim()) {
      try {
        const fetchedNotes = await noteService.getNotes();
        setNotes(fetchedNotes);
      } catch (err) {
        console.error('Error fetching notes:', err);
      }
      return;
    }

    try {
      const searchResults = await noteService.searchNotes(query);
      setNotes(searchResults);
    } catch (err) {
      console.error('Error searching notes:', err);
    }
  };

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <h1>NoteKeeper</h1>
        <div className="user-info">
          <span>Welcome, {user?.name}</span>
          <button onClick={handleLogout} className="logout-btn">Logout</button>
        </div>
      </header>
      
      <div className="dashboard-content">
        {isLoading ? (
          <div className="loading">Loading notes...</div>
        ) : error ? (
          <div className="error-message">{error}</div>
        ) : (
          <>
            <div className="sidebar">
              <NoteList
                notes={notes}
                onSelectNote={handleSelectNote}
                onNewNote={handleNewNote}
                onDeleteNote={handleDeleteNote}
                selectedNoteId={selectedNote?._id || null}
                onSearch={handleSearch}
              />
            </div>
            <div className="main-content">
              <NoteEditor
                selectedNote={selectedNote}
                onSave={handleSaveNote}
                isNew={isCreatingNew}
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Dashboard; 