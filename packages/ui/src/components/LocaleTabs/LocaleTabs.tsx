import { Tabs, TabsList, TabsTrigger } from '@portfolio/ui/components/ui/tabs';
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
    <Tabs value={value} onValueChange={(next) => onChange(next === 'vi' ? 'vi' : 'en')}>
      <TabsList>
        {(['en', 'vi'] as const).map((locale) => (
          <TabsTrigger key={locale} value={locale} disabled={disabled} className="gap-2">
            <span
              aria-hidden
              className={cn(
                'size-1.5 rounded-full',
                completeness[locale] ? 'bg-success' : 'bg-warning',
              )}
            />
            {labels[locale]}
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  );
}
