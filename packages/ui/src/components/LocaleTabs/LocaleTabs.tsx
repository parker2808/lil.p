import { cn } from '@portfolio/ui/lib/utils';

export function LocaleTabs({
  value,
  onChange,
  completeness,
  labels,
  disabled,
}: {
  value: 'en' | 'vi';
  onChange: (locale: 'en' | 'vi') => void;
  completeness: { en: boolean; vi: boolean };
  labels: { en: string; vi: string };
  disabled?: boolean;
}) {
  return (
    <div
      role="group"
      aria-label={`${labels.en} / ${labels.vi}`}
      className="bg-muted inline-flex min-h-12 items-center rounded-md p-0.5"
    >
      {(['en', 'vi'] as const).map((locale) => (
        <button
          key={locale}
          type="button"
          aria-pressed={value === locale}
          disabled={disabled}
          className={cn(
            'text-ui focus-visible:ring-ring inline-flex min-h-11 min-w-11 items-center gap-2 rounded-sm px-2.5 focus-visible:ring-2 focus-visible:outline-none',
            value === locale ? 'bg-card text-foreground' : 'text-muted-foreground',
          )}
          onClick={() => onChange(locale)}
        >
          <span
            aria-hidden
            className={cn(
              'size-1.5 rounded-full',
              completeness[locale] ? 'bg-success' : 'bg-warning',
            )}
          />
          {labels[locale]}
        </button>
      ))}
    </div>
  );
}
