// Create a mock implementation of react-router-dom
const mockNavigate = jest.fn();

const reactRouterDom = {
  BrowserRouter: ({ children }) => children,
  Routes: ({ children }) => children,
  Route: ({ element, path }) => element,
  Navigate: ({ to }) => <div data-testid="navigate" data-to={to}></div>,
  Link: ({ children, to }) => <a href={to || "#"}>{children}</a>,
  useNavigate: () => mockNavigate,
  useParams: jest.fn().mockReturnValue({}),
  useLocation: jest.fn().mockReturnValue({ pathname: '/', search: '', hash: '', state: null }),
  useSearchParams: jest.fn().mockReturnValue([new URLSearchParams(), jest.fn()]),
  Outlet: () => <div data-testid="outlet"></div>,
  MemoryRouter: ({ children, initialEntries }) => {
    // Store initial entries to simulate the current route
    global.__MEMORY_ROUTER_ENTRIES__ = initialEntries || ['/'];
    return children;
  }
};

module.exports = reactRouterDom; 