// src/layouts/ViewerLayout.jsx
import { useLocation } from 'preact-iso';
import { Menubar } from '../components/ui/Menubar.jsx';
import { Statusbar } from '../components/ui/Statusbar.jsx';

export default function ViewerLayout({ children, lessonTitle }) {

  const { back } = useLocation();

  return (
    <div className="flex flex-col h-screen bg-zinc-950 text-white overflow-hidden">
      {/* Slimmer header for viewer */}
      <Menubar 
        title={lessonTitle || "Lesson Viewer"} 
        showBackButton={true}
        onBack={back}
        variant="viewer"   // slim/dark mode
      />

      {/* Full-height content with possible side panels later */}
      <div className="flex-1 flex overflow-hidden relative">
        {children}
      </div>

      <Statusbar variant="viewer" />
    </div>
  );
}