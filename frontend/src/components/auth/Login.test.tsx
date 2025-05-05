import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import Login from './Login';

// Import the auth service directly
import authService, { AuthResponse } from '../../services/authService';

// Mock the auth service
jest.mock('../../services/authService', () => ({
  login: jest.fn(),
  __esModule: true,
  default: {
    login: jest.fn()
  }
}));

// Get the mocked function with correct typing
const mockLogin = authService.login as jest.MockedFunction<typeof authService.login>;

// Mock react-router-dom directly at the top
jest.mock('react-router-dom', () => ({
  useNavigate: () => jest.fn(),
  Link: ({ children }: { children: React.ReactNode }) => <a href="#">{children}</a>
}));

describe('Login Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders login form', () => {
    render(<Login />);
    
    expect(screen.getByText('Login to Your Account')).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument();
    expect(screen.getByText(/don't have an account\?/i)).toBeInTheDocument();
  });

  test('validates form inputs', async () => {
    render(<Login />);
    
    const loginButton = screen.getByRole('button', { name: /login/i });
    
    // Submit the form without filling any fields
    fireEvent.click(loginButton);
    
    // Wait for validation messages
    await waitFor(() => {
      expect(screen.getByText(/email is required/i)).toBeInTheDocument();
      expect(screen.getByText(/password is required/i)).toBeInTheDocument();
    });
  });

  test('validates email format', async () => {
    render(<Login />);
    
    const emailInput = screen.getByLabelText(/email/i);
    const loginButton = screen.getByRole('button', { name: /login/i });
    
    // Enter invalid email
    fireEvent.change(emailInput, { target: { value: 'invalidemail' } });
    fireEvent.click(loginButton);
    
    // Wait for validation message
    await waitFor(() => {
      expect(screen.getByText(/invalid email address/i)).toBeInTheDocument();
    });
  });

  test('submits form with valid data', async () => {
    const mockAuthResponse: AuthResponse = {
      token: 'mock-token',
      user: { id: '1', name: 'Test User', email: 'test@example.com' }
    };
    
    // Setup mock implementation
    mockLogin.mockResolvedValueOnce(mockAuthResponse);
    
    // Mock localStorage
    const localStorageMock = {
      getItem: jest.fn(),
      setItem: jest.fn(),
      clear: jest.fn()
    };
    Object.defineProperty(window, 'localStorage', { value: localStorageMock });
    
    render(<Login />);
    
    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const loginButton = screen.getByRole('button', { name: /login/i });
    
    // Fill the form with valid data
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(loginButton);
    
    // Wait for the form submission to complete
    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123'
      });
      expect(localStorageMock.setItem).toHaveBeenCalledWith('token', 'mock-token');
      expect(localStorageMock.setItem).toHaveBeenCalledWith('user', JSON.stringify(mockAuthResponse.user));
    });
  });

  test('shows error message on login failure', async () => {
    // Setup mock implementation to throw an error
    const mockError = {
      response: {
        data: {
          message: 'Invalid credentials'
        }
      }
    };
    mockLogin.mockRejectedValueOnce(mockError);
    
    render(<Login />);
    
    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const loginButton = screen.getByRole('button', { name: /login/i });
    
    // Fill the form
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'wrongpassword' } });
    fireEvent.click(loginButton);
    
    // Wait for the error message to appear
    await waitFor(() => {
      expect(screen.getByText('Invalid credentials')).toBeInTheDocument();
    });
  });
}); 