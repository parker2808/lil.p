import { getTranslations } from 'next-intl/server';

export default async function NotFound() {
  const t = await getTranslations('states');
  return (
    <div className="mx-auto max-w-prose px-6 py-16">
      <h1 className="font-heading text-heading font-semibold">{t('notFound')}</h1>
    </div>
  );
}
