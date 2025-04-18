import axios from 'axios';
import authService from './authService';

const API_URL = 'http://localhost:5002/api/notes';

export interface Note {
  _id: string;
  title: string;
  content: string;
  user: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateNoteData {
  title: string;
  content: string;
}

export interface UpdateNoteData {
  title?: string;
  content?: string;
}

// Set up request interceptor for authentication
const api = axios.create({
  baseURL: API_URL
});

api.interceptors.request.use(
  (config) => {
    const token = authService.getToken();
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Get all notes
const getNotes = async (): Promise<Note[]> => {
  try {
    const response = await api.get('');
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Get a single note
const getNoteById = async (id: string): Promise<Note> => {
  try {
    const response = await api.get(`/${id}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Create a new note
const createNote = async (noteData: CreateNoteData): Promise<Note> => {
  try {
    const response = await api.post('', noteData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Update a note
const updateNote = async (id: string, noteData: UpdateNoteData): Promise<Note> => {
  try {
    const response = await api.put(`/${id}`, noteData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Delete a note
const deleteNote = async (id: string): Promise<void> => {
  try {
    await api.delete(`/${id}`);
  } catch (error) {
    throw error;
  }
};

// Search notes
const searchNotes = async (query: string): Promise<Note[]> => {
  try {
    const response = await api.get(`/search?query=${encodeURIComponent(query)}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

const noteService = {
  getNotes,
  getNoteById,
  createNote,
  updateNote,
  deleteNote,
  searchNotes
};

export default noteService; 