// @ts-nocheck
import { render } from 'preact';
import { lazy, LocationProvider, ErrorBoundary, Router, Route } from 'preact-iso';

import { Menubar } from './components/ui/Menubar.jsx';
import { Statusbar } from './components/ui/Statusbar.jsx';
import { ConfigProvider, useConfig } from './contexts/ConfigContext';
import { LibraryProvider } from './contexts/LibraryContext.jsx';
import './em3k.css';

// Lazy pages
const Welcome = lazy(() => import('./pages/welcome.jsx'));
const Home = lazy(() => import('./pages/home.jsx'));
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

  // Debugging:
  // console.log('✅ Rendering routes. isFirstRun =', isFirstRun);

  return (
    <ErrorBoundary>
      <Router>
        <Route path="/" component={isFirstRun ? Welcome : Home} />

        {/* Aliases */}
        <Route path="/home" component={Home} />
        <Route path="/dashboard" component={Home} />

        <Route path="/welcome" component={Welcome} />
        <Route path="/library" component={Library} />
        <Route path="/settings" component={Settings} />
        <Route path="/about" component={About} />
        <Route path="/donate" component={Donate} />
        <Route path="/help" component={Help} />
        <Route path="/share" component={Share} />
        <Route path="/report" component={Report} />
        <Route path="/search" component={Search} />

        <Route default component={NotFound} />
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
if (app) render(<App />, app);