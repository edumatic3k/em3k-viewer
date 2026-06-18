// @ts-nocheck
import { useState, useEffect } from 'preact/hooks';

const CACHE_PREFIX = 'em3k_json_';

/**
 * Generic hook for loading JSON resources with caching and optional validation.
 * @param {string} url - Path to JSON (e.g. '/content/metadata/xxx.json')
 * @param {Object} options
 * @param {string} [options.schema] - Schema name for AJV validation (future)
 * @param {boolean} [options.cache = true]
 * @returns {{ data, loading, error, refetch }}
 */
export const useJsonResource = (url, options = {}) => {

  const { cache = true, schema = null } = options;
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const fetchData = async (forceRefresh = false) => {
    setLoading(true);
    setError(null);

    try {
      // 1. Check localStorage cache first
      if (cache && !forceRefresh) {
        const cached = localStorage.getItem(CACHE_PREFIX + url);
        if (cached) {
          const parsed = JSON.parse(cached);
          setData(parsed);
          setLoading(false);
          console.log(`📦 Loaded from cache: ${url}`);
          return parsed; // still do background refresh if needed
        }
      }

      // 2. Network fetch
      const res = await fetch(url);
      if (!res.ok) throw new Error(`Failed to fetch ${url}`);
      const jsonData = await res.json();

      // 3. Optional AJV validation (stub for now)
      if (schema) {
        console.log(`🔍 Would validate against schema: ${schema}`);
        // TODO: Integrate AJV here later
      }

      // 4. Cache to localStorage
      if (cache) {
        localStorage.setItem(CACHE_PREFIX + url, JSON.stringify(jsonData));
      }

      setData(jsonData);
      console.log(`✅ Loaded fresh: ${url}`);
      return jsonData;
    } catch (err) {
      console.error(`❌ useJsonResource failed for ${url}:`, err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (url) fetchData();
  }, [url]);

  const refetch = () => fetchData(true);

  return { data, loading, error, refetch };
};