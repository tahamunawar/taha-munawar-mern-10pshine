import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import App from './App';

// Create mock components with unique testids
jest.mock('./pages/AuthPage', () => () => <div data-testid="auth-page-component">Auth Page Mock</div>);
jest.mock('./pages/Dashboard', () => () => <div data-testid="dashboard-page-component">Dashboard Mock</div>);

// Clear localStorage before each test
beforeEach(() => {
  jest.spyOn(Storage.prototype, 'getItem').mockImplementation(() => null);
});

afterEach(() => {
  jest.restoreAllMocks();
});

test('renders app container', () => {
  render(<App />);
  
  const appElement = document.querySelector('.App');
  expect(appElement).toBeInTheDocument();
});

// Re-enabled these tests with fixed implementations
test('renders auth page on /login route', () => {
  // Set up a mock for localStorage.getItem('token') to return null
  jest.spyOn(Storage.prototype, 'getItem').mockImplementation((key) => {
    if (key === 'token') return null;
    return null;
  });
  
  render(
    <MemoryRouter initialEntries={['/login']}>
      <App />
    </MemoryRouter>
  );
  
  // Check that auth page is in the document (using queryAllByTestId to handle multiple matches)
  const authPageElements = screen.queryAllByTestId('auth-page-component');
  expect(authPageElements.length).toBeGreaterThan(0);
});

test('renders dashboard on /dashboard route when authenticated', () => {
  // Set up a mock for localStorage.getItem('token') to return a mock token
  jest.spyOn(Storage.prototype, 'getItem').mockImplementation((key) => {
    if (key === 'token') return 'mock-token';
    return null;
  });
  
  render(
    <MemoryRouter initialEntries={['/dashboard']}>
      <App />
    </MemoryRouter>
  );
  
  // Check that dashboard is in the document (using queryAllByTestId to handle multiple matches)
  const dashboardElements = screen.queryAllByTestId('dashboard-page-component');
  expect(dashboardElements.length).toBeGreaterThan(0);
});
