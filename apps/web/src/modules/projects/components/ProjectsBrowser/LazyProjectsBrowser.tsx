'use client';

import { Skeleton } from '@portfolio/ui/components/ui/skeleton';
import dynamic from 'next/dynamic';

export const LazyProjectsBrowser = dynamic(
  () => import('./ProjectsBrowser').then((module) => module.ProjectsBrowser),
  { loading: () => <Skeleton className="col-span-full h-80 w-full" /> },
);

/** Unfiltered view for the block's Suspense fallback; keeps the browser out of the page chunk. */
export const LazyProjectsBrowserView = dynamic(
  () => import('./ProjectsBrowser').then((module) => module.ProjectsBrowserView),
  { loading: () => <Skeleton className="col-span-full h-80 w-full" /> },
);
