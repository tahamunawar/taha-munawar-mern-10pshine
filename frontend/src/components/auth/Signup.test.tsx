import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import Signup from './Signup';

// Import the auth service directly
import authService, { AuthResponse } from '../../services/authService';

// Mock the auth service
jest.mock('../../services/authService', () => ({
  register: jest.fn(),
  __esModule: true,
  default: {
    register: jest.fn()
  }
}));

// Get the mocked function with correct typing
const mockRegister = authService.register as jest.MockedFunction<typeof authService.register>;

// Mock navigate function
const mockNavigate = jest.fn();

// Mock the react-router-dom module
jest.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
  Link: ({ children, to }: { children: React.ReactNode; to: string }) => <a href={to}>{children}</a>
}));

describe('Signup Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders signup form', () => {
    render(<Signup />);
    
    expect(screen.getByText('Create a New Account')).toBeInTheDocument();
    expect(screen.getByLabelText(/name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText('Password')).toBeInTheDocument();
    expect(screen.getByLabelText(/confirm password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign up/i })).toBeInTheDocument();
    expect(screen.getByText(/already have an account\?/i)).toBeInTheDocument();
  });

  test('validates required fields', async () => {
    render(<Signup />);
    
    const signupButton = screen.getByRole('button', { name: /sign up/i });
    
    // Submit the form without filling any fields
    fireEvent.click(signupButton);
    
    // Wait for validation messages using getAllByText for password fields
    await waitFor(() => {
      expect(screen.getByText(/name is required/i)).toBeInTheDocument();
      expect(screen.getByText(/email is required/i)).toBeInTheDocument();
      expect(screen.getAllByText(/password is required/i).length).toBeGreaterThan(0);
    });
  });

  test('validates password match', async () => {
    render(<Signup />);
    
    const nameInput = screen.getByLabelText(/name/i);
    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText('Password');
    const confirmPasswordInput = screen.getByLabelText(/confirm password/i);
    const signupButton = screen.getByRole('button', { name: /sign up/i });
    
    // Fill the form with mismatched passwords
    fireEvent.change(nameInput, { target: { value: 'Test User' } });
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.change(confirmPasswordInput, { target: { value: 'password456' } });
    fireEvent.click(signupButton);
    
    // Wait for validation message
    await waitFor(() => {
      expect(screen.getByText(/passwords must match/i)).toBeInTheDocument();
    });
  });

  test('validates password length', async () => {
    render(<Signup />);
    
    const passwordInput = screen.getByLabelText('Password');
    const signupButton = screen.getByRole('button', { name: /sign up/i });
    
    // Enter short password
    fireEvent.change(passwordInput, { target: { value: 'short' } });
    fireEvent.click(signupButton);
    
    // Wait for validation message
    await waitFor(() => {
      expect(screen.getByText(/password must be at least 8 characters/i)).toBeInTheDocument();
    });
  });

  test('submits form with valid data', async () => {
    const mockAuthResponse: AuthResponse = {
      token: 'mock-token',
      user: { id: '1', name: 'Test User', email: 'test@example.com' }
    };
    
    // Setup mock implementation
    mockRegister.mockResolvedValueOnce(mockAuthResponse);
    
    // Mock localStorage
    const localStorageMock = {
      getItem: jest.fn(),
      setItem: jest.fn(),
      clear: jest.fn()
    };
    Object.defineProperty(window, 'localStorage', { value: localStorageMock });
    
    render(<Signup />);
    
    const nameInput = screen.getByLabelText(/name/i);
    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText('Password');
    const confirmPasswordInput = screen.getByLabelText(/confirm password/i);
    const signupButton = screen.getByRole('button', { name: /sign up/i });
    
    // Fill the form with valid data
    fireEvent.change(nameInput, { target: { value: 'Test User' } });
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.change(confirmPasswordInput, { target: { value: 'password123' } });
    fireEvent.click(signupButton);
    
    // Wait for the form submission to complete
    await waitFor(() => {
      expect(mockRegister).toHaveBeenCalledWith({
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123'
      });
      expect(localStorageMock.setItem).toHaveBeenCalledWith('token', 'mock-token');
      expect(localStorageMock.setItem).toHaveBeenCalledWith('user', JSON.stringify(mockAuthResponse.user));
    });
  });

  test('shows error message on signup failure', async () => {
    // Setup mock implementation to throw an error
    const mockError = {
      response: {
        data: {
          message: 'User with this email already exists'
        }
      }
    };
    mockRegister.mockRejectedValueOnce(mockError);
    
    render(<Signup />);
    
    const nameInput = screen.getByLabelText(/name/i);
    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText('Password');
    const confirmPasswordInput = screen.getByLabelText(/confirm password/i);
    const signupButton = screen.getByRole('button', { name: /sign up/i });
    
    // Fill the form
    fireEvent.change(nameInput, { target: { value: 'Test User' } });
    fireEvent.change(emailInput, { target: { value: 'existing@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.change(confirmPasswordInput, { target: { value: 'password123' } });
    fireEvent.click(signupButton);
    
    // Wait for the error message to appear
    await waitFor(() => {
      expect(screen.getByText('User with this email already exists')).toBeInTheDocument();
    });
  });
}); 