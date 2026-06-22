import { TextBlock } from '@components/blocks/TextBlock.jsx';
import { ImageBlock } from '@components/blocks/ImageBlock.jsx';
import { SlideshowBlock } from '@components/blocks/SlideshowBlock.jsx';
import { SpacerBlock } from '@components/blocks/SpacerBlock.jsx';
import { VideoBlock } from '@components/blocks/VideoBlock.jsx';
import { HeadingBlock } from '@components/blocks/HeadingBlock.jsx';
import { ListBlock } from '@components/blocks/ListBlock.jsx';
import { CalloutBlock } from '@components/blocks/CalloutBlock.jsx';
import { TableBlock } from '@components/blocks/TableBlock.jsx';

export function BlockRenderer({ blocks }) {
  if (!blocks || !Array.isArray(blocks)) return null;
  return (
    <div>
      {blocks.map((b, idx) => {
        switch ((b.type || '').toLowerCase()) {
          case 'text':
            return <TextBlock key={b.id || idx} block={b} />;
          case 'image':
            return <ImageBlock key={b.id || idx} block={b} />;
          case 'slideshow':
            return <SlideshowBlock key={b.id || idx} block={b} id={idx} />;
          case 'spacer':
            return <SpacerBlock key={b.id || idx} block={b} />;
          case 'video':
            return <VideoBlock key={b.id || idx} block={b} />;
          case 'heading':
            return <HeadingBlock key={b.id || idx} block={b} />;
          case 'list':
            return <ListBlock key={b.id || idx} block={b} type={b.listType || 'ul'} />;
          case 'callout':
          case 'tip':
          case 'warning':
            return <CalloutBlock key={b.id || idx} block={b} />;
          case 'table':
            return <TableBlock key={b.id || idx} block={b} />;
          default:
            return <div key={b.id || idx} className="mt-3">Unsupported block type: {b.type}</div>;
        }
      })}
    </div>
  );
}
