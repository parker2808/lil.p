'use client';

import { Skeleton } from '@portfolio/ui/components/ui/skeleton';
import dynamic from 'next/dynamic';

export const LazyNotesBrowser = dynamic(
  () => import('./NotesBrowser').then((module) => module.NotesBrowser),
  { loading: () => <Skeleton className="col-span-full h-80 w-full" /> },
);
