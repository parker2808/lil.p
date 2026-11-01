import type { PublicBlock } from '@portfolio/contracts';
import { Skeleton } from '@portfolio/ui/components/ui/skeleton';

import { LazyNotesBrowser } from '@/modules/notes/components/NotesBrowser/LazyNotesBrowser';
import { listPostsPage } from '@/modules/notes/services/posts.service';
import { listTags } from '@/modules/notes/services/tags.service';
import { parseNotesSearch } from '@/modules/notes/utils/notes-query.util';

import type { BlockContext } from '../../types/entities/block-context.type';

export async function NotesBrowserBlock({
  block,
  context,
}: {
  block: PublicBlock;
  context: BlockContext;
}) {
  const props = block.props as { showFeatured?: boolean; pageSize?: number };
  const query = parseNotesSearch(context.searchParams);
  const pageSize = props.pageSize ?? 10;
  const [page, tags] = await Promise.all([
    listPostsPage(context.locale, {
      q: query.q,
      tag: query.tag,
      page: query.page,
      pageSize,
      sort: '-publishedAt',
    }),
    listTags(context.locale),
  ]);

  return (
    <LazyNotesBrowser
      locale={context.locale}
      initial={page}
      tags={tags}
      q={query.q}
      tag={query.tag}
      page={query.page}
      pageSize={pageSize}
      showFeatured={props.showFeatured !== false}
    />
  );
}

export function NotesBrowserSkeleton() {
  return <Skeleton className="col-span-full h-80 w-full" />;
}
