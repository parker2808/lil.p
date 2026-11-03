import { AdminDesignDemo } from './AdminDesignDemo';
import { DemoLocaleProvider } from './demo-jsx/runtime';

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ screen?: string; state?: string; lang?: string }>;
}) {
  const { screen, state, lang } = await searchParams;
  const locale = lang === 'vi' ? 'vi' : 'en';
  return (
    <DemoLocaleProvider locale={locale}>
      <AdminDesignDemo
        initialScreen={screen ?? 'dashboard'}
        initialState={state}
        initialLocale={locale}
      />
    </DemoLocaleProvider>
  );
}
