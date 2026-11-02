import { AdminDesignDemo } from './AdminDesignDemo';

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ screen?: string }>;
}) {
  const { screen } = await searchParams;
  return <AdminDesignDemo initialScreen={screen ?? 'dashboard'} />;
}
