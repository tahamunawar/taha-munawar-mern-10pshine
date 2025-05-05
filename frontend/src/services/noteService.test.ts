// Import Jest functions
import '@testing-library/jest-dom';
import noteService, { Note } from './noteService';

// Mock axios
jest.mock('axios', () => {
  // Create the mock implementation
  return {
    create: jest.fn(() => ({
      get: jest.fn(),
      post: jest.fn(),
      put: jest.fn(),
      delete: jest.fn(),
      interceptors: {
        request: {
          use: jest.fn((callback) => {
            // Automatically execute the callback with a mock config when interceptors are used
            callback({ headers: {} });
            return () => {};
          })
        },
        response: {
          use: jest.fn()
        }
      }
    }))
  };
});

// Mock authService to avoid dependency issues
jest.mock('./authService', () => ({
  getToken: jest.fn(() => 'mock-token')
}));

// Import axios after the mock is defined
import axios from 'axios';

// Get the mocked axios instance
const axiosCreate = jest.spyOn(axios, 'create');
const mockApi = axiosCreate.mock.results[0]?.value || {
  get: jest.fn(),
  post: jest.fn(),
  put: jest.fn(),
  delete: jest.fn()
};

// Mock local storage for token
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  clear: jest.fn(),
  removeItem: jest.fn(),
  key: jest.fn(),
  length: 0
};
Object.defineProperty(window, 'localStorage', { value: localStorageMock });

describe('Note Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorageMock.getItem.mockReturnValue('mock-token');
  });

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

  test('getNotes should fetch all notes', async () => {
    mockApi.get.mockResolvedValueOnce({ data: mockNotes });
    
    const result = await noteService.getNotes();
    
    expect(mockApi.get).toHaveBeenCalledWith('');
    expect(result).toEqual(mockNotes);
  });

  test('getNoteById should fetch a single note', async () => {
    mockApi.get.mockResolvedValueOnce({ data: mockNotes[0] });
    
    const result = await noteService.getNoteById('1');
    
    expect(mockApi.get).toHaveBeenCalledWith('/1');
    expect(result).toEqual(mockNotes[0]);
  });

  test('createNote should create a new note', async () => {
    const newNote = {
      title: 'New Note',
      content: 'New content'
    };
    
    mockApi.post.mockResolvedValueOnce({ data: { ...newNote, _id: '3', user: 'user1', createdAt: '2023-01-03T00:00:00.000Z', updatedAt: '2023-01-03T00:00:00.000Z' } });
    
    const result = await noteService.createNote(newNote);
    
    expect(mockApi.post).toHaveBeenCalledWith('', newNote);
    expect(result).toHaveProperty('_id', '3');
    expect(result).toHaveProperty('title', 'New Note');
    expect(result).toHaveProperty('content', 'New content');
  });

  test('updateNote should update an existing note', async () => {
    const updatedNote = {
      title: 'Updated Note',
      content: 'Updated content'
    };
    
    const expectedResponse = {
      ...mockNotes[0],
      title: 'Updated Note',
      content: 'Updated content',
      updatedAt: '2023-01-04T00:00:00.000Z'
    };
    
    mockApi.put.mockResolvedValueOnce({ data: expectedResponse });
    
    const result = await noteService.updateNote('1', updatedNote);
    
    expect(mockApi.put).toHaveBeenCalledWith('/1', updatedNote);
    expect(result).toEqual(expectedResponse);
  });

  test('deleteNote should delete a note', async () => {
    mockApi.delete.mockResolvedValueOnce({ data: { message: 'Note deleted successfully' } });
    
    await noteService.deleteNote('1');
    
    expect(mockApi.delete).toHaveBeenCalledWith('/1');
  });

  test('searchNotes should search for notes with a query', async () => {
    mockApi.get.mockResolvedValueOnce({ data: [mockNotes[0]] });
    
    const result = await noteService.searchNotes('Test Note 1');
    
    expect(mockApi.get).toHaveBeenCalledWith('/search?query=Test%20Note%201');
    expect(result).toEqual([mockNotes[0]]);
  });

  test('services should handle errors', async () => {
    mockApi.get.mockRejectedValueOnce(new Error('Network error'));
    
    await expect(noteService.getNotes()).rejects.toThrow('Network error');
  });
}); 