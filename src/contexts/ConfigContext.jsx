import { createContext, useContext, useEffect, useState } from 'preact/compat';

/** @type {import('preact').Context<any>} */
const ConfigContext = createContext(null);

export const useConfig = () => {
  const context = useContext(ConfigContext);
  if (!context) {
    throw new Error('useConfig must be used within a ConfigProvider');
  }
  return context;
};

/** @param {{ children: import('preact').ComponentChildren }} props */
export const ConfigProvider = ({ children }) => {
  const [config, setConfig] = useState(null);
  const [contentIndex, setContentIndex] = useState(null);
  const [isFirstRun, setIsFirstRun] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const initialize = async () => {
      try {
        const configRes = await fetch('/content/metadata/config.json');
        if (!configRes.ok) throw new Error('Failed to load config');
        const loadedConfig = await configRes.json();

        const indexRes = await fetch('/content/metadata/content-index.json');
        if (!indexRes.ok) throw new Error('Failed to load content index');
        const loadedIndex = await indexRes.json();

        let firstRun = localStorage.getItem('isFirstRun') === null;
        if (firstRun) {
          localStorage.setItem('isFirstRun', 'false');
        }

        setConfig(loadedConfig);
        setContentIndex(loadedIndex);
        setIsFirstRun(firstRun);
        setLoading(false);
      } catch (err) {
        console.error('Config initialization failed:', err);
        const errorMessage = err instanceof Error ? err.message : String(err);
        setError(errorMessage);
        setLoading(false);
      }
    };

    initialize();
  }, []);

  const value = {
    config,
    contentIndex,
    isFirstRun,
    loading,
    error,
  };

  return (
    <ConfigContext.Provider value={value}>
      {children}
    </ConfigContext.Provider>
  );
};