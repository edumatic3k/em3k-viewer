// src/contexts/ConfigContext.jsx
import { createContext, useContext, useState, useEffect } from 'preact/compat';
import { loadAndValidate } from '../utils/jsonLoader';
import configSchema from '../schemas/config.schema.json';
import appSchema from '../schemas/app.schema.json';
import configDefaults from '../defaults/config.defaults.json';

const ConfigContext = createContext();

export function ConfigProvider({ children }) {
  const [config, setConfig] = useState(configDefaults);
  const [validationErrors, setValidationErrors] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [app, setApp] = useState(null);

  useEffect(() => {
    async function initConfig() {
      setIsLoading(true);

      // Load app metadata (engine-owned) so we can expose app info and
      // potentially run a version/update check. Use a safe default when
      // the file is missing or malformed.
      const defaultAppConfig = {
        title: 'Edumatic 3000 (em3k)',
        version: '0.0.0',
        engineUrl: '',
        updateUrl: '',
        publicKey: '',
        author: '',
        email: '',
        organization: '',
        published: '',
        lastUpdated: ''
      };

      const runAppVersionCheck = async (appCfg) => {
        // Placeholder for future version/update verification logic.
        // For now this is a no-op that returns true.
        return true;
      };

      // Load and validate engine-owned `/app.json` using the shared loader so
      // we get consistent validation and defaults merging behavior.
      try {
        const appResult = await loadAndValidate(
          '/app.json',
          'app',
          appSchema,
          defaultAppConfig
        );

        setApp(appResult.data || defaultAppConfig);

        if (!appResult.valid) {
          console.warn('App metadata validation failed', appResult.errors);
        }

        try {
          await runAppVersionCheck(appResult.data || defaultAppConfig);
        } catch (e) {
          console.warn('App version check failed', e);
        }
      } catch (e) {
        console.warn('Unexpected error loading app.json', e);
        setApp(defaultAppConfig);
      }

      const result = await loadAndValidate(
        '/config.json',           // Teacher-editable file
        'config',                 // Schema key
        configSchema,             // Imported schema
        configDefaults            // Safe fallback
      );

      setConfig(result.data);

      if (!result.valid && result.errors) {
        setValidationErrors(result.errors);
        console.warn('Config validation issues - using defaults where necessary');
      } else {
        setValidationErrors(null);
      }

      setIsLoading(false);
    }

    initConfig();
  }, []);

  const value = {
    config,
    app,
    validationErrors,
    isLoading,
    reloadConfig: () => window.location.reload(), // simple way for now
  };

  return (
    <ConfigContext.Provider value={value}>
      {children}
    </ConfigContext.Provider>
  );
}

export const useConfig = () => useContext(ConfigContext);

/**
 * Component wrapper that delays rendering until config has loaded.
 * @param {{children: import('preact').ComponentChildren, fallback: any}} props
 */
export function ConfigLoader({ children, fallback = null }) {
  const { isLoading } = useContext(ConfigContext);
  if (isLoading) return fallback;
  return children;
}