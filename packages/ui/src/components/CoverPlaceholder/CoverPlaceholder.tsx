import type { Hue } from '@portfolio/contracts';
import { cn } from '@portfolio/ui/lib/utils';

export function CoverPlaceholder({
  hue = 'JADE',
  ratio = '16 / 10',
  className,
}: {
  hue?: Hue;
  ratio?: '16 / 10' | '21 / 9';
  className?: string;
}) {
  const hueVar = `--hue-${hue.toLowerCase()}`;

  return (
    <div
      data-slot="cover-placeholder"
      aria-hidden
      className={cn('bg-muted relative flex flex-col overflow-hidden', className)}
      style={{
        aspectRatio: ratio,
        backgroundImage: `linear-gradient(180deg, color-mix(in srgb, var(${hueVar}) 16%, var(--muted)), var(--muted))`,
      }}
    >
      <div className="border-border bg-card/70 flex h-7 items-center gap-1.5 border-b px-3">
        <i className="bg-border-strong size-1.5 rounded-full" />
        <i className="bg-border-strong size-1.5 rounded-full" />
        <i className="bg-border-strong size-1.5 rounded-full" />
      </div>
      <div className="flex min-h-0 flex-1">
        <div className="bg-foreground/5 flex w-16 flex-col gap-1.5 px-2 py-2.5">
          <b className="bg-foreground/10 block h-1.5 rounded-sm" />
          <b className="bg-foreground/10 block h-1.5 rounded-sm" />
          <b className="bg-foreground/10 block h-1.5 rounded-sm" />
        </div>
        <div className="flex min-w-0 flex-1 flex-col gap-2 px-3.5 py-3">
          <div className="flex h-16 items-end gap-1.5">
            <i
              className="h-6 flex-1 rounded-t-sm"
              style={{ background: `color-mix(in srgb, var(${hueVar}) 55%, transparent)` }}
            />
            <i
              className="h-8 flex-1 rounded-t-sm"
              style={{ background: `color-mix(in srgb, var(${hueVar}) 55%, transparent)` }}
            />
            <i
              className="h-12 flex-1 rounded-t-sm"
              style={{ background: `color-mix(in srgb, var(${hueVar}) 55%, transparent)` }}
            />
            <i
              className="h-10 flex-1 rounded-t-sm"
              style={{ background: `color-mix(in srgb, var(${hueVar}) 55%, transparent)` }}
            />
            <i
              className="h-14 flex-1 rounded-t-sm"
              style={{ background: `color-mix(in srgb, var(${hueVar}) 55%, transparent)` }}
            />
          </div>
          <div className="bg-foreground/10 h-2 rounded" />
          <div className="bg-foreground/10 h-2 w-3/4 rounded" />
        </div>
      </div>
    </div>
  );
}
