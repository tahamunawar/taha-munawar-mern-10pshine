import axios from 'axios';

const API_URL = 'http://localhost:5001/api/auth';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
}

const login = async (credentials: LoginCredentials): Promise<AuthResponse> => {
  try {
    const response = await axios.post(`${API_URL}/login`, credentials);
    return response.data;
  } catch (error) {
    throw error;
  }
};

const register = async (userData: RegisterData): Promise<AuthResponse> => {
  try {
    const response = await axios.post(`${API_URL}/register`, userData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

const logout = (): void => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
};

const isAuthenticated = (): boolean => {
  return localStorage.getItem('token') !== null;
};

const getToken = (): string | null => {
  return localStorage.getItem('token');
};

const getUser = (): any => {
  const user = localStorage.getItem('user');
  return user ? JSON.parse(user) : null;
};

const authService = {
  login,
  register,
  logout,
  isAuthenticated,
  getToken,
  getUser
};

export default authService; 