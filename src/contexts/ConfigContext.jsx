import { createContext, useContext, useEffect, useState } from 'preact/compat';

const ConfigContext = createContext();

export const useConfig = () => useContext(ConfigContext);

export const ConfigProvider = ({ children }) => {
  const [config, setConfig] = useState(null);
  const [contentIndex, setContentIndex] = useState(null);
  const [isFirstRun, setIsFirstRun] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const initialize = async () => {
      try {
        // Load static config
        const configRes = await fetch('/content/metadata/config.json');
        if (!configRes.ok) throw new Error('Failed to load config');
        const loadedConfig = await configRes.json();

        // Load content index
        const indexRes = await fetch('/content/metadata/content-index.json');
        if (!indexRes.ok) throw new Error('Failed to load content index');
        const loadedIndex = await indexRes.json();

        // First-run handling (localStorage)
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
        setError(err.message);
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