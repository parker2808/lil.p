import { getTranslations } from 'next-intl/server';
import Link from 'next/link';

export default async function AdminNotFound() {
  const t = await getTranslations('admin.notFound');

  return (
    <div className="mx-auto flex max-w-prose flex-col gap-4 py-16">
      <h1 className="font-heading text-heading font-semibold">{t('title')}</h1>
      <p className="text-muted-foreground">{t('description')}</p>
      <Link href="/admin" className="text-primary underline underline-offset-4">
        {t('dashboard')}
      </Link>
    </div>
  );
}
