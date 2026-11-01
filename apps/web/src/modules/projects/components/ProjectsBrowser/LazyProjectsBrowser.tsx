'use client';

import { Skeleton } from '@portfolio/ui/components/ui/skeleton';
import dynamic from 'next/dynamic';

export const LazyProjectsBrowser = dynamic(
  () => import('./ProjectsBrowser').then((module) => module.ProjectsBrowser),
  { loading: () => <Skeleton className="col-span-full h-80 w-full" /> },
);
