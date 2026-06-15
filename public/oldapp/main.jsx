import { render } from 'preact';
import { App } from '@components/App.jsx';
import { ConfigProvider, ConfigLoader } from '@contexts/ConfigContext.jsx';
import { JourneyProvider } from '@contexts/JourneyContext.jsx';
import { RouteGuardProvider } from '@contexts/RouteGuardContext.jsx';

async function init() {
  // Register service worker if available
  if ('serviceWorker' in navigator) {
    try {
      await navigator.serviceWorker.register('/sw.js');
      // console.log('Service worker registered');
    } catch (err) {
      console.warn('Service worker registration failed', err);
    }
  }

  // Render app with all providers at the top level
  render(
    <ConfigProvider>
      <ConfigLoader>
        <JourneyProvider>
          <RouteGuardProvider>
            <App />
          </RouteGuardProvider>
        </JourneyProvider>
      </ConfigLoader>
    </ConfigProvider>,
    document.getElementById('app')
  );
}

init();

