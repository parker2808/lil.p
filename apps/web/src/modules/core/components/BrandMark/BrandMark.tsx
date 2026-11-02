/* eslint-disable react/jsx-no-literals -- The shared personal wordmark is a fixed brand asset. */

import Image from 'next/image';

export function BrandMark({
  compact = false,
  className = '',
}: {
  compact?: boolean;
  className?: string;
}) {
  return (
    <span className={`brand-mark ${className}`} role="img" aria-label="parker">
      <Image src="/icon.svg" alt="" width={32} height={32} unoptimized aria-hidden />
      {compact ? null : <span className="brand-mark-word">parker</span>}
    </span>
  );
}
