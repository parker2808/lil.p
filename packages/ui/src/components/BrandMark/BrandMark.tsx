/* eslint-disable react/jsx-no-literals -- The fixed wordmark is a brand asset. */

export function BrandMark({
  compact = false,
  className = '',
}: {
  compact?: boolean;
  className?: string;
}) {
  return (
    <span
      className={`brand-mark ${className}`}
      role="img"
      aria-label="lil.parker"
      data-brand-source="/icon.svg"
    >
      <img src="/icon.svg" alt="" width="32" height="32" aria-hidden="true" />
      {compact ? null : <span className="brand-mark-word">lil.parker</span>}
    </span>
  );
}
