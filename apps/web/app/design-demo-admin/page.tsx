import { AdminDesignDemo } from './AdminDesignDemo';

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ screen?: string; state?: string; lang?: string }>;
}) {
  const { screen, state, lang } = await searchParams;
  return (
    <AdminDesignDemo
      initialScreen={screen ?? 'dashboard'}
      initialState={state}
      initialLocale={lang}
    />
  );
}
