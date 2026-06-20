// @ts-nocheck
import { render } from 'preact';
import { lazy, LocationProvider, ErrorBoundary, Router } from 'preact-iso';
import { Menubar } from './components/ui/Menubar.jsx';
import { Statusbar } from './components/ui/Statusbar.jsx';
import { ConfigProvider, useConfig } from './contexts/ConfigContext';
import { LibraryProvider } from './contexts/LibraryContext.jsx';
import './em3k.css';

const Welcome = lazy(() => import('./pages/welcome.jsx'));
const Home = lazy(() => import('./pages/home.jsx'));           // Dashboard
const Library = lazy(() => import('./pages/library.jsx'));
const Settings = lazy(() => import('./pages/settings.jsx'));
const About = lazy(() => import('./pages/about.jsx'));
const Donate = lazy(() => import('./pages/donate.jsx'));
const Help = lazy(() => import('./pages/help.jsx'));
const Share = lazy(() => import('./pages/share.jsx'));
const Report = lazy(() => import('./pages/report.jsx'));
const Search = lazy(() => import('./pages/search.jsx'));
const NotFound = lazy(() => import('./pages/_404.jsx'));

const AppRoutes = () => {
  const { isFirstRun, loading, error } = useConfig();

  if (loading) return <div className="loading-screen">Initializing EM3K Viewer...</div>;
  if (error) return <div className="error">Error loading config: {error}</div>;

  return (
    <ErrorBoundary>
      <Router>
        <Welcome path="/" condition={() => isFirstRun} />
        <Home path="/" condition={() => !isFirstRun} />
        <Home path="/home" />
        <Home path="/dashboard" />
        <Welcome path="/welcome" />
        <Library path="/library" />
        <Settings path="/settings" />
        <About path="/about" />
        <Donate path="/donate" />
        <Help path="/help" />
        <Share path="/share" />
        <Report path="/report" />
        <Search path="/search" />
        <NotFound default />
      </Router>
    </ErrorBoundary>
  );
};

export function App() {
  return (
    <LocationProvider>
      <ConfigProvider>
        <LibraryProvider>
          <Menubar />
          <AppRoutes />
          <Statusbar />
        </LibraryProvider>
      </ConfigProvider>
    </LocationProvider>
  );
}

const app = document.getElementById('app');
if (app) {
  render(<App />, app);
}