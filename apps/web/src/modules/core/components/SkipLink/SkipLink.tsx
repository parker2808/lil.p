import { getTranslations } from 'next-intl/server';

export async function SkipLink() {
  const t = await getTranslations('core');
  return (
    <a
      href="#content"
      className="bg-primary text-primary-foreground focus:z-skip sr-only focus:not-sr-only focus:absolute focus:top-3 focus:left-3 focus:rounded-md focus:px-3 focus:py-2"
    >
      {t('skip')}
    </a>
  );
}
