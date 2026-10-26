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
      className="bg-muted inline-flex h-8 items-center rounded-md p-0.5"
    >
      {(['en', 'vi'] as const).map((locale) => (
        <button
          key={locale}
          type="button"
          aria-pressed={value === locale}
          disabled={disabled}
          className={cn(
            'text-ui inline-flex h-7 items-center gap-2 rounded-sm px-2.5',
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
