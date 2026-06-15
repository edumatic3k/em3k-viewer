import { useEffect } from 'preact/hooks';
import { route } from 'preact-router';
import { useLessonData } from '@contexts/LessonContext.jsx';
import { BlockRenderer } from '@components/blocks/BlockRenderer.jsx';

/**
 * Renders a lesson intro page
 * Displays intro content and a "Start Lesson" button
 */
export function LessonIntroPage({ lessonId, lessonNumber }) {

  const { getIntroPage, getLessonInfo, manifest, loading, error } = useLessonData();
  const currentLessonNum = lessonNumber || 1;

  if (loading) return null;
  if (error) return <div className="container mt-4">Error: {error}</div>;
  if (!manifest) return <div className="container mt-4">Lesson not found</div>;

  const lessonInfo = getLessonInfo(); // Use current lesson from journey
  const introData = getIntroPage();
  const introMeta = introData?.metadata || {};
  const introHeading = introData?.heading || introMeta.title;
  const introSubhead = introData?.subhead || introMeta.description;
  const introClass = introMeta.template ? `lesson-intro fade-in template-${introMeta.template}` : 'lesson-intro fade-in';

  if (!lessonInfo) {
    return <div className="container mt-4">Lesson not found</div>;
  }

  if (!introData) {
    return <div className="container mt-4">Intro not found</div>;
  }

  const handleStartLesson = () => {
    // Navigate to first page
    route(`/lessons/${lessonId}/${currentLessonNum}/page/1`);
  };

  useEffect(() => {
    const title = introMeta.title || introHeading || `Lesson ${lessonInfo.number}`;
    document.title = title;
    window.scrollTo(0, 0);
  }, [introMeta.title, introHeading, lessonInfo.number]);

  return (
    <div className={introClass}>
      <div className="container">

        <h2 className="lessontitle">{lessonInfo.title}</h2>

        {introHeading && <h3 className="mt-5 fs-3 fw-bold">{introHeading}</h3>}
        {introSubhead && <p className="mb-4 fst-italic text-secondary">{introSubhead}</p>}
        
        <BlockRenderer blocks={introData.blocks || []} />

        <div className="my-5 py-2 text-center">
          <button className="btn btn-primary btn-lg px-5 py-3 fw-bold border border-2 border-dark" style={{fontFamily: 'sans-serif'}} onClick={handleStartLesson}>
            Start The Lesson <i class="bi bi-arrow-right-square fs-4 ms-3"></i>
          </button>
        </div>

        <br/>

      </div>
    </div>
  );
}
