/*
Lesson Loader
Simple loader to fetch lesson manifest/pages into a small cache.
Config loading is handled by ConfigContext.

API:
- loadLessonManifest(lessonId) -> returns manifest JSON
- loadPageJson(lessonId, filename) -> returns parsed JSON
- getPagesList(manifest) -> returns array of { lessonNumber, pageNum, filename }
- clearCache() -> clears all caches (for dev/testing)
- reloadManifest(lessonId) -> clears and reloads a specific manifest

This loader assumes files exist under /lessons/{lessonId}/ and that the app is served from the project root.
*/

const LESSONS_BASE = '/lessons';

const cache = {
  manifests: {},
  pages: {}
};

export async function loadLessonManifest(lessonId) {
  if (cache.manifests[lessonId]) return cache.manifests[lessonId];
  const path = `${LESSONS_BASE}/${lessonId}/manifest.json`;
  try {
    const res = await fetch(path, { cache: 'no-store' });
    if (!res.ok) throw new Error(`Failed to fetch ${path}`);
    const json = await res.json();
    cache.manifests[lessonId] = json;
    return json;
  } catch (e) {
    console.error('loadLessonManifest error', e);
    return null;
  }
}

export async function loadPageJson(lessonId, filename) {
  const key = `${lessonId}::${filename}`;
  if (cache.pages[key]) return cache.pages[key];
  const path = `${LESSONS_BASE}/${lessonId}/${filename}`;
  try {
    const res = await fetch(path, { cache: 'no-store' });
    if (!res.ok) {
      // Return null for 404s (missing files are expected during preload)
      if (res.status === 404) {
        return null;
      }
      throw new Error(`Failed to fetch ${path} (HTTP ${res.status})`);
    }
    
    // Check content type to ensure we're getting JSON
    const contentType = res.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      console.warn(`Expected JSON but received ${contentType || 'unknown'} for ${path}`);
      return null;
    }
    
    const json = await res.json();
    cache.pages[key] = json;
    return json;
  } catch (e) {
    // Only log errors for non-404 failures
    if (e.message && !e.message.includes('404')) {
      console.error('loadPageJson error', e);
    }
    return null;
  }
}

export function getPagesList(manifest) {
  // Flatten manifest.lessons into a pages list with file paths suitable for nested lesson folders.
  // If the lesson entry provides explicit filenames, those are used as-is.
  if (!manifest || !Array.isArray(manifest.lessons)) return [];
  const pages = [];

  const resolveLessonPath = (lessonFolder, filename) => {
    if (!filename) return null;
    return filename.includes('/') ? filename : `${lessonFolder}/${filename}`;
  };

  manifest.lessons.forEach((lsn) => {
    const lessonNumber = lsn.number;
    const lessonFolder = lsn.folder || `lesson-${lessonNumber}`;

    if (lsn.hasIntro) {
      const filename = resolveLessonPath(lessonFolder, lsn.introFile || 'intro.json');
      pages.push({ lessonNumber, type: 'intro', filename });
    }

    if (Array.isArray(lsn.pageFiles) && lsn.pageFiles.length > 0) {
      lsn.pageFiles.forEach((filename, index) => {
        const pageNum = index + 1;
        const resolvedFilename = resolveLessonPath(lessonFolder, filename);
        pages.push({ lessonNumber, type: 'page', page: pageNum, filename: resolvedFilename });
      });
    } else {
      const pageCount = Number.isFinite(lsn.pages) ? lsn.pages : 0;
      for (let i = 1; i <= pageCount; i++) {
        const filename = `${lessonFolder}/page-${i}.json`;
        pages.push({ lessonNumber, type: 'page', page: i, filename });
      }
    }

    if (lsn.hasQuiz) {
      const filename = resolveLessonPath(lessonFolder, lsn.quizFile || 'quiz.json');
      pages.push({ lessonNumber, type: 'quiz', filename });
    }
  });

  return pages;
}

/**
 * Clear all cached manifests and pages
 * Useful for dev/testing to force re-fetch from server
 */
export function clearCache() {
  cache.manifests = {};
  cache.pages = {};
  console.log('Lesson loader cache cleared');
}

/**
 * Clear and reload a specific lesson manifest
 * @param {string} lessonId - The lesson set ID
 * @returns {Promise<Object|null>} The reloaded manifest
 */
export async function reloadManifest(lessonId) {
  delete cache.manifests[lessonId];
  // Also clear all pages for this lesson
  Object.keys(cache.pages).forEach((key) => {
    if (key.startsWith(`${lessonId}::`)) {
      delete cache.pages[key];
    }
  });
  console.log(`Reloading manifest for lesson "${lessonId}"`);
  return loadLessonManifest(lessonId);
}
