import type { PublicBlock } from '@portfolio/contracts';
import { PostCard } from '@portfolio/ui/components/PostCard/PostCard';
import { Reveal } from '@portfolio/ui/components/Reveal/Reveal';
import { Skeleton } from '@portfolio/ui/components/ui/skeleton';
import { getTranslations } from 'next-intl/server';

import { listPosts } from '@/modules/notes/services/posts.service';

import type { BlockHeadingProps } from '../../types/entities/block-heading.type';
import type { BlockContext } from '../../types/entities/block-context.type';
import { renderAppLink } from '../../utils/render-app-link.util';
import { BlockHeading } from '../BlockHeading/BlockHeading';

function formatDate(value: string | null, locale: 'en' | 'vi'): string {
  if (!value) {
    return '';
  }
  return new Intl.DateTimeFormat(locale === 'vi' ? 'vi' : 'en', { dateStyle: 'medium' }).format(
    new Date(value),
  );
}

export async function PostListBlock({
  block,
  context,
}: {
  block: PublicBlock;
  context: BlockContext;
}) {
  const props = block.props as { heading?: BlockHeadingProps; limit?: number; tag?: string };
  const [posts, t] = await Promise.all([
    listPosts(context.locale, {
      pageSize: props.limit ?? 3,
      tag: props.tag,
      sort: '-publishedAt',
    }),
    getTranslations('blocks'),
  ]);
  if (posts.length < 1) {
    return null;
  }

  return (
    <>
      <Reveal className="col-span-full">
        <BlockHeading heading={props.heading} />
      </Reveal>
      {posts.map((post) => (
        <Reveal key={post.id} lang={block.lang}>
          <PostCard
            post={post}
            href={`/notes/${post.slug}`}
            dateLabel={formatDate(post.publishedAt, context.locale)}
            labels={{ minutes: t('minutes') }}
            renderLink={renderAppLink}
          />
        </Reveal>
      ))}
    </>
  );
}

export function PostListSkeleton() {
  return <Skeleton className="col-span-full h-40 w-full" />;
}
