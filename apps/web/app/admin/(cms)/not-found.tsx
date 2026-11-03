import { getTranslations } from 'next-intl/server';
import Link from 'next/link';
import { cookies } from 'next/headers';

export default async function AdminNotFound() {
  const locale = (await cookies()).get('NEXT_LOCALE')?.value === 'vi' ? 'vi' : 'en';
  const t = await getTranslations({ locale, namespace: 'admin.notFound' });

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
