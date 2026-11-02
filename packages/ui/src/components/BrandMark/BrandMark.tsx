import type { CSSProperties } from 'react';

/** The public and admin shells share the same SVG source as the app icons. */
export function BrandMark({ className, style }: { className?: string; style?: CSSProperties }) {
  return (
    <img
      src="/icon.svg"
      alt=""
      width={40}
      height={40}
      className={className}
      style={style}
      aria-hidden="true"
    />
  );
}
