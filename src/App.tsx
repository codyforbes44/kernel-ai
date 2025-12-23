import { BrowserRouter } from 'react-router-dom';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { AppProviders } from '@/providers';
import { GlobalComponents } from '@/components/GlobalComponents';
import { RouteRenderer } from '@/components/routing';

/**
 * Main App component with simplified structure.
 * 
 * Architecture:
 * - ErrorBoundary: Top-level error catching
 * - AppProviders: All context providers (Query, Theme, Auth, etc.)
 * - GlobalComponents: Toast, PWA, Command Palette
 * - RouteRenderer: Data-driven route generation
 */
const App = () => (
  <ErrorBoundary>
    <AppProviders>
      <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <GlobalComponents />
        <RouteRenderer />
      </BrowserRouter>
    </AppProviders>
  </ErrorBoundary>
);

export default App;
