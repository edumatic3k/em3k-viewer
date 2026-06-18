// @ts-nocheck
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
  const [userPrefs, setUserPrefs] = useState(null);
  const [isFirstRun, setIsFirstRun] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

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

        // === BACKUP CONFIG TO LOCALSTORAGE ===
        try {
          localStorage.setItem('em3k_config_backup', JSON.stringify(loadedConfig));
          localStorage.setItem('em3k_content_index_backup', JSON.stringify(loadedIndex));
          console.log('✅ Config backed up to localStorage');
        } catch (backupErr) {
          console.warn('Could not backup config to localStorage:', backupErr);
        }

        // === UPDATE CHECK PLACEHOLDER ===
        if (loadedConfig?.app?.version) {
          console.log(`🔄 Current app version: ${loadedConfig.app.version}`);
          // TODO: Future update checking logic here
        }

        // === LOAD & MERGE USER PREFERENCES ===
        const prefsRes = await fetch('/content/user-data/preferences.json');
        if (!prefsRes.ok) throw new Error('Failed to load preferences');
        const defaultPrefs = await prefsRes.json();

        let mergedPrefs = { ...defaultPrefs };

        const savedPrefs = localStorage.getItem('em3k_user_preferences');
        if (savedPrefs) {
          mergedPrefs = { ...defaultPrefs, ...JSON.parse(savedPrefs) };
        }

        // Save merged preferences back to localStorage
        localStorage.setItem('em3k_user_preferences', JSON.stringify(mergedPrefs));
        console.log('✅ User preferences loaded and backed up');

        // First-run handling
        let firstRun = localStorage.getItem('isFirstRun') === null;
        if (firstRun) {
          localStorage.setItem('isFirstRun', 'false');
        }

        setConfig(loadedConfig);
        setContentIndex(loadedIndex);
        setUserPrefs(mergedPrefs);
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
    userPrefs,
    isFirstRun,
    loading,
    error,
    // Helper for updating preferences later
    updateUserPrefs: (newValues) => {
      // Temporary implementation - we'll improve with proper state update soon
      const updated = { ...userPrefs, ...newValues };
      localStorage.setItem('em3k_user_preferences', JSON.stringify(updated));
      window.location.reload(); // force refresh for now
    }
  };

  return (
    <ConfigContext.Provider value={value}>
      {children}
    </ConfigContext.Provider>
  );
};