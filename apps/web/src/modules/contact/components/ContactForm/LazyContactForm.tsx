'use client';

import { Skeleton } from '@portfolio/ui/components/ui/skeleton';
import dynamic from 'next/dynamic';

export const LazyContactForm = dynamic(
  () => import('./ContactForm').then((module) => module.ContactForm),
  { loading: () => <Skeleton className="h-96 w-full" /> },
);
