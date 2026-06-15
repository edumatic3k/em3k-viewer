import { useConfig } from '@contexts/ConfigContext.jsx';
import { useEffect, useState } from 'preact/hooks';
import { route } from 'preact-router';

/**
 * SimpleBreadcrumb - for Intro and Student Info pages
 * Shows Home / Introduction / Student Info based on config features
 */

export function SimpleBreadcrumb({ current }) {
  
  const { config } = useConfig();
  const [items, setItems] = useState([]);

  useEffect(() => {
    if (!config || !config.features) return;
    const { siteIntro, studentInfo } = config.features;
    const crumbs = [
      { label: 'Home', url: '/', isHome: true }
    ];
    if (siteIntro) {
      crumbs.push({ label: 'Introduction', url: '/intro' });
    }
    if (studentInfo) {
      crumbs.push({ label: 'Student Info', url: '/studentinfo' });
    }
    setItems(crumbs);
  }, [config]);

  // Determine which crumb is current
  const getIsCurrent = (item) => {
    if (current === 'home' && item.isHome) return true;
    if (current === 'intro' && item.url === '/intro') return true;
    if (current === 'studentinfo' && item.url === '/studentinfo') return true;
    return false;
  };

  return (
    <nav className="mb-3">
      <ol className="breadcrumb fs-6" id="bctitems">
        {items.map((it, idx) => (
          <li
            key={idx}
            className={`breadcrumb-item${getIsCurrent(it) ? ' active bct-active' : ''}`}
            aria-current={getIsCurrent(it) ? 'page' : undefined}
          >
            {it.isHome ? (
              getIsCurrent(it) ? (
                <img
                  src="/assets/img/em3k.svg"
                  alt="Home"
                  style="height: 1.25rem; width: auto; vertical-align: middle;"
                />
              ) : (
                <a href={it.url} title="Home">
                  <img
                    src="/assets/img/em3k.svg"
                    alt="Home"
                    style="height: 1.25rem; width: auto; vertical-align: middle;"
                  />
                </a>
              )
            ) : getIsCurrent(it) ? (
              <span>{it.label}</span>
            ) : (
              <a href={it.url}>{it.label}</a>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
