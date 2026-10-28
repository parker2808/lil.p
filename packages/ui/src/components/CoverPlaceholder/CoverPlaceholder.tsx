import type { Hue } from '@portfolio/contracts';
import { cn } from '@portfolio/ui/lib/utils';

export function CoverPlaceholder({
  hue = 'JADE',
  ratio = '16 / 10',
  className,
  title = '',
  slug = '',
}: {
  hue?: Hue;
  ratio?: '16 / 10' | '21 / 9';
  className?: string;
  title?: string;
  slug?: string;
}) {
  const hueVar = `--hue-${hue.toLowerCase()}`;

  return (
    <div
      data-slot="cover-placeholder"
      aria-hidden
      className={cn('bg-muted relative flex flex-col overflow-hidden', className)}
      style={{
        aspectRatio: ratio,
        backgroundImage: `repeating-radial-gradient(ellipse at 85% 100%, transparent 0 12px, color-mix(in srgb, var(${hueVar}) 12%, transparent) 13px 14px), linear-gradient(135deg, color-mix(in srgb, var(${hueVar}) 22%, var(--background)), var(--card))`,
      }}
    >
      <span className="cover-glyph">
        {title
          .split(/\s+/)
          .filter(Boolean)
          .slice(0, 2)
          .map((word) => Array.from(word)[0])
          .join('')}
      </span>
      <span className="cover-slug">{slug}</span>
    </div>
  );
}
