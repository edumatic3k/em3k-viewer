import { TextBlock } from './TextBlock.jsx';
import { ImageBlock } from './ImageBlock.jsx';
import { SlideshowBlock } from './SlideshowBlock.jsx';
import { SpacerBlock } from './SpacerBlock.jsx';
import { VideoBlock } from './VideoBlock.jsx';
import { HeadingBlock } from './HeadingBlock.jsx';
import { ListBlock } from './ListBlock.jsx';
import { CalloutBlock } from './CalloutBlock.jsx';

export function BlockRenderer({ blocks, resolveAsset = (path) => path }) {
  if (!blocks || !Array.isArray(blocks)) return null;
  return (
    <div>
      {blocks.map((b, idx) => {
        switch ((b.type || '').toLowerCase()) {
          case 'text':
            return <TextBlock key={b.id || idx} block={b} />;
          case 'image':
            return <ImageBlock key={b.id || idx} block={{ ...b, src: resolveAsset(b.src) }} />;
          case 'slideshow':
            return <SlideshowBlock key={b.id || idx} block={{ ...b, images: b.images?.map((image) => ({ ...image, src: resolveAsset(image.src) })) }} id={idx} />;
          case 'spacer':
            return <SpacerBlock key={b.id || idx} block={b} />;
          case 'video':
            return <VideoBlock key={b.id || idx} block={{ ...b, src: resolveAsset(b.src) }} />;
          case 'heading':
            return <HeadingBlock key={b.id || idx} block={b} />;
          case 'list':
            return <ListBlock key={b.id || idx} block={b} type={b.style === 'ordered' ? 'ol' : 'ul'} />;
          case 'callout':
            return <CalloutBlock key={b.id || idx} block={b} />;
          default:
            return <div key={b.id || idx} className="mt-3">Unsupported block type: {b.type}</div>;
        }
      })}
    </div>
  );
}
