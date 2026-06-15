import { OffCanvasMenu } from '@components/ui/OffCanvasMenu.jsx';

export function LessonTemplate({ children }) {
  return (
    <div className="app container p-3 fade-in">
      <main>
        {children}
      </main>
      <OffCanvasMenu />
    </div>
  );
}
