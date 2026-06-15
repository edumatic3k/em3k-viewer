// src/layouts/DefaultLayout.jsx
import { Menubar } from '../components/Menubar.jsx';
import { Statusbar } from '../components/Statusbar.jsx';
import { Onlinestatus } from '../components/Onlinestatus.jsx';

export default function DefaultLayout({ children, title = "em3k Viewer" }) {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* Top Navigation */}
      <Menubar title={title} />

      {/* Main Content Area */}
      <main className="flex-1 container mx-auto px-4 py-6 max-w-7xl">
        {children}
      </main>

      {/* Bottom Status Bar */}
      <Statusbar>
        <Onlinestatus />
      </Statusbar>
    </div>
  );
}