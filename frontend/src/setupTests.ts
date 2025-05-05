// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';

// Mock window.confirm and window.alert
window.confirm = jest.fn(() => true);
window.alert = jest.fn();

// Setup localStorage mock
const localStorageMock = {
  getItem: jest.fn((key) => {
    // Default implementation to work with auth checks
    if (key === 'token') return null;
    if (key === 'user') return null;
    return null;
  }),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
  length: 0,
  key: jest.fn(),
};

Object.defineProperty(window, 'localStorage', { value: localStorageMock });

// Fix for ResizeObserver errors in React 19
class ResizeObserverMock {
  observe = jest.fn();
  unobserve = jest.fn();
  disconnect = jest.fn();
}

window.ResizeObserver = ResizeObserverMock;

// Suppress React 18 and 19 console errors during testing
const originalConsoleError = console.error;
console.error = (...args) => {
  if (
    /Warning.*not wrapped in act/i.test(args[0]) ||
    /Warning: ReactDOM.render is no longer supported/i.test(args[0]) ||
    /Warning: The current testing environment/i.test(args[0]) ||
    /Warning: ReactDOM.createRoot/i.test(args[0]) ||
    /Warning: You are using React 19/i.test(args[0])
  ) {
    return;
  }
  originalConsoleError(...args);
};
