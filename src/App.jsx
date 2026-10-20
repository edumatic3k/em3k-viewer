// @ts-nocheck
import { render } from 'preact';
import { lazy, LocationProvider, ErrorBoundary as IsoErrorBoundary, Router, Route } from 'preact-iso';
import { LibraryProvider, useLibrary } from './contexts/LibraryContext.jsx';
import './em3k.css';

// Lazy pages
const Welcome = lazy(() => import('./pages/welcome.jsx'));
const Home = lazy(() => import('./pages/home.jsx'));
const Library = lazy(() => import('./pages/library.jsx'));
const Catalog = lazy(() => import('./pages/catalog.jsx'));
const Details = lazy(() => import('./pages/details.jsx'));
const Settings = lazy(() => import('./pages/settings.jsx'));
const About = lazy(() => import('./pages/about.jsx'));
const Donate = lazy(() => import('./pages/donate.jsx'));
const Help = lazy(() => import('./pages/help.jsx'));
const Share = lazy(() => import('./pages/share.jsx'));
const Report = lazy(() => import('./pages/report.jsx'));
const Search = lazy(() => import('./pages/search.jsx'));
const NotFound = lazy(() => import('./pages/_404.jsx'));
const ErrorPage = lazy(() => import('./pages/error.jsx'));
const CourseViewer = lazy(() => import('./pages/courseviewer/courseViewer'));

// Custom wrapper so we can pass error + reset props
const AppErrorBoundary = ({ children }) => {
  return (
    <IsoErrorBoundary
      onError={(error) => {
        console.error('App Error Caught:', error);
        // Optional: send to analytics / logging later
      }}
    >
      {children}
    </IsoErrorBoundary>
  );
};

const AppRoutes = () => {
  const { loading, error } = useLibrary();

  if (loading) return <div className="loading-screen">Initializing Em3k Viewer...</div>;
  if (error) return <div className="error">Error loading config: {error}</div>;

  return (
    <AppErrorBoundary>
      <Router>
        <Route path="/" component={Home} />

        {/* Aliases */}
        <Route path="/home" component={Home} />
        <Route path="/dashboard" component={Home} />

        {/* Pages */}
        <Route path="/welcome" component={Welcome} />
        <Route path="/library" component={Library} />
        <Route path="/catalog" component={Catalog} />
        <Route path="/details" component={Details} />
        <Route path="/settings" component={Settings} />
        <Route path="/about" component={About} />
        <Route path="/donate" component={Donate} />
        <Route path="/help" component={Help} />
        <Route path="/share" component={Share} />
        <Route path="/report" component={Report} />
        <Route path="/search" component={Search} />

        {/* Course Viewer */}
        <Route path="/course/:courseSlug" component={CourseViewer} />
         
        {/* 404 Not Found Page */}
        <Route default component={NotFound} />
      </Router>
    </AppErrorBoundary>
  );
};

export function App() {
  return (
    <LocationProvider>
      <LibraryProvider>
        <AppRoutes />
      </LibraryProvider>
    </LocationProvider>
  );
}

const app = document.getElementById('app');
if (app) render(<App />, app);