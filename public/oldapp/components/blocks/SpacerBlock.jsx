
export function SpacerBlock({ block }) {
  const className = ['mt-3', block.className || ''].join(' ').trim();
  const style = block.style || undefined;

  return (
    <div className={className} style={style}>
      <br />
    </div>
  );
}
