import { useEffect, useRef } from 'preact/hooks';
import { route } from 'preact-router';
import { useLessonData } from '@contexts/LessonContext.jsx';
import { useJourney } from '@contexts/JourneyContext.jsx';
import { BlockRenderer } from '@components/blocks/BlockRenderer.jsx';
import { FinalButton } from '@components/ui/FinalButton.jsx';
import { ProgressIndicator } from '@components/ui/ProgressIndicator.jsx';

// Renders a page from a lesson JSON-first structure using lesson context
export function LessonViewer({ lessonId, pageNum }) {

  const { getPage, getLessonInfo, loading, error } = useLessonData();
  const { updateCurrentPosition, updateLessonProgress } = useJourney();
  const rootRef = useRef(null);

  // Get the page data from context (uses current lesson number from journey)
  const lessonInfo = getLessonInfo();
  const pageData = getPage(null, pageNum); // null means use current lesson from journey
  const pageMeta = pageData?.metadata || {};
  const pageHeading = pageData?.heading || pageMeta.title;
  const pageSubhead = pageData?.subhead || pageMeta.description;
  const pageClass = pageMeta.template ? `template-${pageMeta.template}` : '';

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [lessonId, pageNum]);

  useEffect(() => {
    if (lessonInfo) {
      updateCurrentPosition(
        lessonId,
        lessonInfo.number,
        Number(pageNum),
        `/lessons/${lessonId}/${lessonInfo.number}/page/${pageNum}`
      );
      updateLessonProgress(lessonInfo.number, Number(pageNum));

      const title = pageMeta.title || pageData?.heading || `Lesson ${lessonInfo.number}`;
      document.title = title;
    }
  }, [lessonId, pageNum, lessonInfo, pageMeta.title, pageData?.heading, updateCurrentPosition, updateLessonProgress]);

  // Intercept clicks on internal links injected into sanitized HTML
  useEffect(()=>{
    const el = rootRef.current;
    if (!el) return;
    const onClick = (ev) => {
      const a = ev.target.closest && ev.target.closest('a[data-internal]');
      if (a) {
        ev.preventDefault();
        const href = a.getAttribute('href');
        if (href) {
          route(href);
        }
      }
    };
    el.addEventListener('click', onClick);
    return () => el.removeEventListener('click', onClick);
  }, []);

  if (loading) return null;
  if (error) return <div>Error: {error}</div>;
  if (!lessonInfo) return <div>Lesson not found</div>;
  if (!pageData) return <div>Page {pageNum} not found</div>;

  return (
    <div ref={rootRef} className={`lesson-page ${pageClass}`}>
      <div className="container">

        <h2 className="lessontitle">{lessonInfo.title}</h2>
        
        <ProgressIndicator currentPage={pageNum} />

        {pageHeading && <h3 className="mt-5 fs-3 fw-bold">{pageHeading}</h3>}
        {pageSubhead && <p className="mb-4 fst-italic text-secondary">{pageSubhead}</p>}

        <BlockRenderer blocks={pageData.blocks || []} />

        <br/>

        {/* Page Navigation */}
        <div className="d-flex justify-content-center my-5">

          {pageNum > 1 && (
            // Previous button
            <button className="btn btn-primary btn-lg px-5 py-3 fw-bold border border-2 border-dark shadow" style={{fontFamily: 'sans-serif'}} onClick={() => {
              route(`/lessons/${lessonId}/${lessonInfo.number}/page/${Number(pageNum) - 1}`);
            }}><i class="bi bi-arrow-left-square fs-5 me-2"></i> Previous
            </button>
          )}

          {pageNum > 1 && (
            // don't show spacer on first page
            <div className="d-flex" style={{width: '60px'}}></div>
          )}

          {lessonInfo && pageNum < lessonInfo.pages && (
            // Next button
            <button className="btn btn-primary btn-lg px-5 py-3 fw-bold border border-2 border-dark shadow" style={{fontFamily: 'sans-serif'}} onClick={() => {
              const nextPage = Number(pageNum) + 1;
              route(`/lessons/${lessonId}/${lessonInfo.number}/page/${nextPage}`);
            }}>Next <i class="bi bi-arrow-right-square fs-5 ms-2"></i>
            </button>
          )}

          {/* Smart final button: Take Quiz, Next Lesson, or Finish */}
          <FinalButton lessonId={lessonId} currentPage={pageNum} />

        </div>

      </div>
    </div>
  );
}
