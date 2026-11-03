'use client';

import { PublicErrorState } from '@/modules/core/components/PublicErrorState/PublicErrorState';

export default function SiteError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return <PublicErrorState error={error} reset={reset} />;
}
