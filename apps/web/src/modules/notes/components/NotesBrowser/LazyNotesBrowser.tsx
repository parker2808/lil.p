'use client';

import dynamic from 'next/dynamic';

export const LazyNotesBrowser = dynamic(() =>
  import('./NotesBrowser').then((module) => module.NotesBrowser),
);
