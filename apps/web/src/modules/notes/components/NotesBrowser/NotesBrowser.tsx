'use client';

import type { Locale, PublicPostListPage, PublicTag } from '@portfolio/contracts';
import { useTranslations } from 'next-intl';

import { QueryProvider } from '@/modules/core/components/Providers/QueryProvider';
import { renderAppLink } from '@/modules/blocks/utils/render-app-link.util';

import { useNotesSearch } from '../../hooks/use-notes-search.hook';
import { NotesSearch } from '../NotesSearch/NotesSearch';
import { PostList } from '../PostList/PostList';
import { TagFilter } from '../TagFilter/TagFilter';

export function NotesBrowser(props: Parameters<typeof NotesBrowserContent>[0]) {
  return (
    <QueryProvider>
      <NotesBrowserContent {...props} />
    </QueryProvider>
  );
}

function NotesBrowserContent({
  locale,
  initial,
  tags,
  q,
  tag,
  page,
  pageSize,
  showFeatured,
}: {
  locale: Locale;
  initial: PublicPostListPage;
  tags: PublicTag[];
  q?: string;
  tag?: string;
  page: number;
  pageSize: number;
  showFeatured: boolean;
}) {
  const t = useTranslations('notes');
  const states = useTranslations('states');
  const blocks = useTranslations('blocks');
  const query = useNotesSearch({
    locale,
    params: { q, tag, page, pageSize, sort: '-publishedAt' },
    initialData: initial,
  });
  const data = query.data ?? initial;
  const featured =
    showFeatured && page === 1 && !q && !tag
      ? (data.items.find((item) => item.isFeatured) ?? null)
      : null;
  const emptyMessage = q ? t('noneFor', { name: q }) : states('empty');

  return (
    <>
      <NotesSearch
        key={`${q ?? ''}:${tag ?? ''}`}
        q={q}
        tag={tag}
        labels={{ search: t('search'), hint: t('hint') }}
      />
      <TagFilter
        tags={tags}
        activeSlug={tag}
        q={q}
        labels={{ all: t('all') }}
        renderLink={renderAppLink}
      />
      <PostList
        page={data}
        featured={featured}
        q={q}
        tag={tag}
        locale={locale}
        emptyMessage={emptyMessage}
        labels={{
          minutes: blocks('minutes'),
          clear: t('clear'),
          previous: t('previous'),
          next: t('next'),
          pagination: t('pagination'),
          results: t('results', { count: data.total }),
        }}
        renderLink={renderAppLink}
      />
    </>
  );
}
