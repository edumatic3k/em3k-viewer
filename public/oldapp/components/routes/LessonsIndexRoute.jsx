import { useEffect } from 'preact/hooks';
import { route } from 'preact-router';
import { loadLessonManifest } from '@utils/lessonLoader.js';

export function LessonsIndexRoute({ id }) {
  useEffect(() => {
    async function redirect() {
      // If no ID, redirect to the default lesson intro or home
      if (!id) {
        route('/');
        return;
      }

      // Load the manifest to check if lesson has intro
      try {
        const manifest = await loadLessonManifest(id);
        
        if (!manifest || !manifest.lessons || manifest.lessons.length === 0) {
          // Invalid lesson, go home
          route('/');
          return;
        }

        const firstLesson = manifest.lessons[0];
        
        // Redirect based on whether the first lesson has an intro
        if (firstLesson.hasIntro) {
          route(`/lessons/${id}/intro`);
        } else {
          route(`/lessons/${id}/page/1`);
        }
      } catch (err) {
        console.error('Failed to load lesson manifest for redirect:', err);
        route('/');
      }
    }

    redirect();
  }, [id]);

  return <div className="container my-5">Redirecting...</div>;
}
