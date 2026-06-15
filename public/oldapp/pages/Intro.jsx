import { useConfig } from '@contexts/ConfigContext.jsx';
import { useEffect } from 'preact/hooks';
import { navigateToLessonIntro } from '@utils/routing.js';
import { route } from 'preact-router';

export function IntroPage() {

  const { config } = useConfig();

  useEffect(() => {
    document.title = 'Introduction';
    window.scrollTo(0, 0);
  }, []);

  // Get intro page config
  const defaultIntroParagraph = 'This is the introduction page for your course. You can control whether this page is displayed in the configuration file. If the value for "siteIntro" is set to "true" then this page will appear.';
  const introConfig = config.intropage || {
    pagetitle: 'Welcome',
    paragraphs: [defaultIntroParagraph],
    pageimage: '/assets/img/placeholder.svg',
    imgcaption: ''
  };

  const introParagraphs = Array.isArray(introConfig.paragraphs) && introConfig.paragraphs.length > 0
    ? introConfig.paragraphs
    : [defaultIntroParagraph];

  return (
    <div>

      <h2 className="display-5 my-4">{introConfig.pagetitle}</h2>

      {/* Responsive intro: image stacks on small screens, floats right on md+ */}
      <div>
        {introConfig.pageimage && (
          <figure className="intro-figure text-center border border-1 border-dark rounded-5">
            <img
              src={introConfig.pageimage}
              className="img-fluid"
              alt={introConfig.imgcaption || 'Intro image'}
              title={introConfig.imgcaption || ''}
            />
            {introConfig.imgcaption && (
              <figcaption className="figure-caption text-center opacity-50">
                {introConfig.imgcaption}
              </figcaption>
            )}
          </figure>
        )}

        <div>
          {introParagraphs.map((paragraph, index) => (
            <p key={index} className="mt-4">{paragraph}</p>
          ))}
        </div>
      </div>

      {/* Large action button */}
      <div className="my-5 text-center">
        {/* <button
          className="btn btn-danger px-5 py-3 btntext shadow border border-2 border-dark me-4"
          onClick={() => route('/')}
        >
          <i className="bi bi-arrow-left"></i> Back
        </button> */}
        <button
          className="btn btn-success mt-sm-2 mt-md-0 px-5 py-3 btntext shadow border border-2 border-dark cta-large"
          onClick={async () => {
            try {
              await navigateToLessonIntro(null, 'intro', config);
            } catch (err) {
              console.error('Navigation failed:', err);
            }
          }}
        >
          Begin Your Journey <i className="bi bi-person-walking ms-2"></i>
        </button>
      </div>
    </div>
  );
}
