import { render } from 'preact';
import { LocationProvider, Router, Route } from 'preact-iso';
import { Menubar } from './components/ui/Menubar.jsx';
import { Statusbar } from './components/ui/Statusbar.jsx';
import { Welcome } from './pages/welcome.jsx';
import { Home } from './pages/home.jsx';
import { Library } from './pages/library.jsx';
import { LessonIndex } from './pages/lessonIndex.jsx';
import { Settings } from './pages/settings.jsx';
import { About } from './pages/about.jsx';
import { Donate } from './pages/donate.jsx';
import { Help } from './pages/help.jsx';
import { Share } from './pages/share.jsx';
import { Report } from './pages/report.jsx';
import { Search } from './pages/search.jsx';
import { NotFound } from './pages/_404.jsx';
import { ConfigProvider, useConfig } from './contexts/ConfigContext';
import './em3k.css';

/** @type {HTMLElement | null} */
const app = document.getElementById('app');

const AppRoutes = () => {
  const { isFirstRun, loading, error } = useConfig();

  if (loading) return <div className="loading-screen">Initializing EM3K Viewer...</div>;
  if (error) return <div className="error">Error loading config: {error}</div>;

  return (
    <Router>
      <Route path="/" component={isFirstRun ? Welcome : Home} />
      <Route path="/home" component={Home} />
	  <Route path="/welcome" component={Welcome} />
	  <Route path="/library" component={Library} />
	  <Route path="/lessons" component={LessonIndex} />
	  <Route path="/settings" component={Settings} />
	  <Route path="/about" component={About} />
	  <Route path="/donate" component={Donate} />
	  <Route path="/help" component={Help} />
	  <Route path="/share" component={Share} />
	  <Route path="/report" component={Report} />
	  <Route path="/search" component={Search} />
	  <Route default component={NotFound} />
    </Router>
  );
};

export function App() {
	return (
		<ConfigProvider>
			<LocationProvider>
				<Menubar/>
					<AppRoutes />
				<Statusbar/>
			</LocationProvider>
		</ConfigProvider>
	);
}

if (app) {
  render(<App />, app);
}
