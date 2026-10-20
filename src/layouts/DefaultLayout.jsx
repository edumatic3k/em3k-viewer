import { useEffect } from 'preact/hooks';
import { Menubar } from '../components/ui/Menubar.jsx';
import { Statusbar } from '../components/ui/Statusbar.jsx';

/**
 * @param {object} props
 * @param {import('preact').ComponentChildren} props.children
 * @param {string} [props.title='Em3k)']
 */
export default function DefaultLayout({ children, title = 'Em3k' }) {

  useEffect(() => {
    document.title = title ? `Em3k: ${title}` : 'Em3k';
  }, [title]);

  return (
    <div className="min-vh-100 d-flex flex-column">
      <Menubar />
      <main className="container-fluid ps-3 pe-4 mb-5">
          {children}
      </main>
      <Statusbar />
    </div>
  );
}