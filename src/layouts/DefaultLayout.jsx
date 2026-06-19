import { useEffect } from 'preact/hooks';
import { Menubar } from '../components/ui/Menubar.jsx';
import { Statusbar } from '../components/ui/Statusbar.jsx';

/**
 * @param {object} props
 * @param {import('preact').ComponentChildren} props.children
 * @param {string} [props.title='Em3k)']
 */
export default function DefaultLayout({ children, title = 'EM3K' }) {

  useEffect(() => {
    document.title = title ? `EM3K: ${title}` : 'EM3K';
  }, [title]);

  return (
    <div className="min-vh-100 d-flex flex-column">
      <Menubar />
      <main className="container-fluid ps-3 pe-4">
          {children}
      </main>
      <Statusbar />
    </div>
  );
}