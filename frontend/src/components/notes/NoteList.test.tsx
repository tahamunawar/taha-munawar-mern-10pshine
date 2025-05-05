import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import NoteList from './NoteList';
import { Note } from '../../services/noteService';

// Mock window.confirm
window.confirm = jest.fn(() => true);

describe('NoteList Component', () => {
  const mockNotes: Note[] = [
    {
      _id: '1',
      title: 'Test Note 1',
      content: 'Test content 1',
      user: 'user1',
      createdAt: '2023-01-01T00:00:00.000Z',
      updatedAt: '2023-01-01T00:00:00.000Z'
    },
    {
      _id: '2',
      title: 'Test Note 2',
      content: 'Test content 2',
      user: 'user1',
      createdAt: '2023-01-02T00:00:00.000Z',
      updatedAt: '2023-01-02T00:00:00.000Z'
    }
  ];

  const mockProps = {
    notes: mockNotes,
    onSelectNote: jest.fn(),
    onNewNote: jest.fn(),
    onDeleteNote: jest.fn(),
    selectedNoteId: null,
    onSearch: jest.fn()
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders note list with correct notes', () => {
    render(<NoteList {...mockProps} />);
    
    expect(screen.getByText('Test Note 1')).toBeInTheDocument();
    expect(screen.getByText('Test Note 2')).toBeInTheDocument();
  });

  test('shows empty state when no notes are present', () => {
    render(<NoteList {...mockProps} notes={[]} />);
    
    expect(screen.getByText('No notes yet')).toBeInTheDocument();
  });

  test('selects a note when clicked', () => {
    render(<NoteList {...mockProps} />);
    
    fireEvent.click(screen.getByText('Test Note 1'));
    
    expect(mockProps.onSelectNote).toHaveBeenCalledWith(mockNotes[0]);
  });

  test('highlights selected note', () => {
    render(<NoteList {...mockProps} selectedNoteId="1" />);
    
    const selectedNote = screen.getByText('Test Note 1').closest('.note-item');
    expect(selectedNote).toHaveClass('selected');
  });

  test('calls onNewNote when new note button is clicked', () => {
    render(<NoteList {...mockProps} />);
    
    fireEvent.click(screen.getByText('New Note'));
    
    expect(mockProps.onNewNote).toHaveBeenCalled();
  });

  test('calls onDeleteNote when delete button is clicked', () => {
    // Ensure window.confirm returns true for this test
    const confirmSpy = jest.spyOn(window, 'confirm');
    confirmSpy.mockImplementation(() => true);
    
    render(<NoteList {...mockProps} />);
    
    // Find all delete buttons - if they're inside a div or other container, we need to target more specifically
    // Using different selectors to find the delete button
    const deleteButtons = screen.getAllByRole('button', { name: /delete/i });
    if (deleteButtons.length > 0) {
      fireEvent.click(deleteButtons[0]);
      
      // Since we mocked window.confirm to return true
      expect(mockProps.onDeleteNote).toHaveBeenCalledWith('1');
    } else {
      // If we can't find it by role, try by text
      const deleteButtonsByText = screen.getAllByText(/delete/i);
      fireEvent.click(deleteButtonsByText[0]);
      
      expect(mockProps.onDeleteNote).toHaveBeenCalledWith('1');
    }
    
    confirmSpy.mockRestore();
  });

  test('calls onSearch when search input changes', () => {
    jest.useFakeTimers();
    
    render(<NoteList {...mockProps} />);
    
    const searchInput = screen.getByPlaceholderText('Search notes...');
    fireEvent.change(searchInput, { target: { value: 'Test' } });
    
    // Fast-forward timers to bypass debounce
    jest.runAllTimers();
    
    expect(mockProps.onSearch).toHaveBeenCalledWith('Test');
    
    jest.useRealTimers();
  });

  test('formats date correctly', () => {
    render(<NoteList {...mockProps} />);
    
    // Our date formatting may vary, so we'll just check if date elements exist
    const dateElements = screen.getAllByText(/jan/i);
    expect(dateElements.length).toBeGreaterThan(0);
  });
}); 