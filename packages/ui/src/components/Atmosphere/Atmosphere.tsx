import { cn } from '@portfolio/ui/lib/utils';

export function Atmosphere({
  variant,
  enabled,
  className,
}: {
  variant: 'hero' | 'cta';
  enabled: boolean;
  className?: string;
}) {
  if (!enabled) {
    return null;
  }

  return (
    <div
      aria-hidden
      data-slot="atmosphere"
      data-variant={variant}
      className={cn('pointer-events-none absolute inset-0 overflow-hidden', className)}
    >
      <div
        className="absolute inset-0"
        style={{
          backgroundImage:
            'linear-gradient(var(--grid-line) 1px, transparent 1px), linear-gradient(90deg, var(--grid-line) 1px, transparent 1px)',
          backgroundSize: '3rem 3rem',
          maskImage: 'radial-gradient(ellipse at center, black 40%, transparent 80%)',
        }}
      />
      <div
        className="orb absolute size-64 rounded-full blur-3xl"
        style={{
          background: 'var(--glow)',
          top: variant === 'hero' ? '-10%' : 'auto',
          bottom: variant === 'cta' ? '-20%' : 'auto',
          right: '10%',
        }}
      />
      {variant === 'hero' ? (
        <div
          className="orb absolute -bottom-16 -left-10 size-48 rounded-full blur-3xl"
          style={{ background: 'var(--glow)' }}
        />
      ) : null}
    </div>
  );
}
