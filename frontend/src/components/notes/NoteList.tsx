import React, { useState, useEffect } from 'react';
import { Note } from '../../services/noteService';
import './NoteList.css';

interface NoteListProps {
  notes: Note[];
  onSelectNote: (note: Note) => void;
  onNewNote: () => void;
  onDeleteNote: (id: string) => void;
  selectedNoteId: string | null;
  onSearch: (query: string) => void;
}

const NoteList: React.FC<NoteListProps> = ({
  notes,
  onSelectNote,
  onNewNote,
  onDeleteNote,
  selectedNoteId,
  onSearch,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  
  // Effect to handle debounced search
  useEffect(() => {
    const debounceTimeout = setTimeout(() => {
      onSearch(searchQuery);
    }, 500);

    return () => clearTimeout(debounceTimeout);
  }, [searchQuery, onSearch]);

  // Function to format the date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }).format(date);
  };

  // Function to create a short preview of content
  const createPreview = (content: string) => {
    // Remove HTML tags from content for preview
    const plainText = content.replace(/<[^>]*>/g, '');
    return plainText.length > 50 ? plainText.substring(0, 50) + '...' : plainText;
  };

  return (
    <div className="note-list-container">
      <div className="note-list-header">
        <h2>My Notes</h2>
        <button className="new-note-button" onClick={onNewNote}>
          New Note
        </button>
      </div>
      
      <div className="search-container">
        <input
          type="text"
          placeholder="Search notes..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="search-input"
        />
      </div>
      
      <div className="notes-list">
        {notes.length === 0 ? (
          <div className="no-notes-message">
            {searchQuery ? 'No notes match your search' : 'No notes yet'}
          </div>
        ) : (
          notes.map((note) => (
            <div
              key={note._id}
              className={`note-item ${selectedNoteId === note._id ? 'selected' : ''}`}
              onClick={() => onSelectNote(note)}
            >
              <div className="note-item-content">
                <h3 className="note-item-title">{note.title}</h3>
                <p className="note-item-preview">{createPreview(note.content)}</p>
                <p className="note-item-date">{formatDate(note.updatedAt)}</p>
              </div>
              <button 
                className="delete-note-button"
                onClick={(e) => {
                  e.stopPropagation();
                  if (window.confirm('Are you sure you want to delete this note?')) {
                    onDeleteNote(note._id);
                  }
                }}
              >
                Delete
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default NoteList; 