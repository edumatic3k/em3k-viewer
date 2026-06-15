import { useConfig } from '@contexts/ConfigContext.jsx';
import { useState, useEffect } from 'preact/hooks';
import { getNextRoute } from '@utils/routing.js';

export function HomePage() {

  const { config, app } = useConfig();
  const [nextRoute, setNextRoute] = useState('/intro');

  useEffect(() => {
    document.title = config?.title || app?.title || 'Edumatic 3000 (em3k)';
    document.body.style.backgroundColor = '#868d92';
    // Determine next route based on config settings
    (async () => {
      const route = await getNextRoute('home', config);
      setNextRoute(route);
    })();
    return () => {
      document.body.style.backgroundColor = ''; 
    };
  }, [app, config]);

  return (
    <>
      <div className="p-4 mb-3 border border-2 border-dark rounded-5 shadow bg-white">

        <h2 id="welcometext" className="text-center mb-5 welcometext">{config?.title || app?.title || 'Edumatic 3000 (em3k)'}</h2>
        <div id="maindesc" className="mt-2">{config.branding.mainDesc}</div>

        <div className="text-center mt-5 mb-3">
          <h4 id="cta" className="fw-bold cta mb-4">{config.branding.cta || ''}</h4>
          <a href={nextRoute} tabindex="2">
            <img id="mainimg" src={config.branding.mainImg || '/assets/img/placeholder.svg'} alt="Click Here to Start" title="Click Here to Start" height="250" width="250" className="mx-auto imggrow" />
          </a>
        </div>

        <figure className="text-center opacity-50 w-50 mx-auto mt-5">
          <blockquote className="blockquote fst-italic">
            <p id="mainquote">{config.branding.quote}</p>
          </blockquote>
          <figcaption className="blockquote-footer text-dark">
            <cite id="citation">{config.branding.citation}</cite>
          </figcaption>
        </figure> 

        <br />

        <div id="mainopttext" className="mt-2">{config.branding.optText}</div>

      </div>
    </>
  );
}
