import { Link } from '@i18n/navigation';
import type { Locale } from '@portfolio/contracts';
import { ContentProgress } from '@portfolio/ui/components/ContentProgress/ContentProgress';
import { SectionNav } from '@portfolio/ui/components/SectionNav/SectionNav';
import { TakeawaysCard } from '@portfolio/ui/components/TakeawaysCard/TakeawaysCard';
import { getTranslations } from 'next-intl/server';
import { notFound } from 'next/navigation';

import { Markdown } from '@/modules/content/components/Markdown/Markdown';
import { extractToc } from '@/modules/content/utils/toc.util';
import { projectNeighbors } from '@/modules/projects/utils/case-study.util';
import { JsonLd } from '@/modules/seo/components/JsonLd/JsonLd';
import {
  blogPostingJsonLd,
  breadcrumbListJsonLd,
  crumbLabel,
} from '@/modules/seo/utils/json-ld.util';
import { absoluteUrl } from '@/modules/seo/utils/site-url.util';

import { PostHeader } from '../components/PostHeader/PostHeader';
import { PostPrevNext } from '../components/PostPrevNext/PostPrevNext';
import { getPostOrNull, listPosts } from '../services/posts.service';

export async function NotesDetail({ locale, slug }: { locale: Locale; slug: string }) {
  const post = await getPostOrNull(slug, locale);
  if (!post) {
    notFound();
  }

  const [ordered, t, blocks, content] = await Promise.all([
    listPosts(locale, { pageSize: 100, sort: '-publishedAt' }),
    getTranslations('notes'),
    getTranslations('blocks'),
    getTranslations('content'),
  ]);
  const { prev, next } = projectNeighbors(ordered, post.slug);
  const toc = extractToc(post.body);
  const dateLabel = post.publishedAt
    ? new Intl.DateTimeFormat(locale, { dateStyle: 'medium' }).format(new Date(post.publishedAt))
    : '';
  const crumbs = crumbLabel[locale];

  return (
    <article className="notes-reader">
      <JsonLd data={blogPostingJsonLd(post, locale)} />
      <JsonLd
        data={breadcrumbListJsonLd([
          { name: crumbs.home, url: absoluteUrl(locale, '/') },
          { name: crumbs.notes, url: absoluteUrl(locale, '/notes') },
          { name: post.title, url: absoluteUrl(locale, `/notes/${post.slug}`) },
        ])}
      />
      <ContentProgress scrollTargetId="reader-content" />
      <nav className="reader-index" aria-label={t('title')}>
        <Link href="/notes" className="tap font-mono text-xs uppercase">
          {t('title')}
        </Link>
        <ol>
          {ordered.map((item, index) => (
            <li key={item.id}>
              <Link
                href={`/notes/${item.slug}`}
                aria-current={item.slug === slug ? 'page' : undefined}
              >
                <span aria-hidden>{String(index + 1).padStart(2, '0')}</span>
                {item.title}
              </Link>
            </li>
          ))}
        </ol>
      </nav>
      <div className="reader-body grid items-start gap-10 lg:grid-cols-12">
        <div id="reader-content" className="flex flex-col gap-10 lg:col-span-8">
          <PostHeader
            post={post}
            dateLabel={dateLabel}
            labels={{ minutes: blocks('minutes'), note: t('note') }}
          />
          <Markdown source={post.body} />
          <TakeawaysCard title={content('keyTakeaways')} items={post.takeaways} />
          <PostPrevNext prev={prev} next={next} locale={locale} minutes={blocks('minutes')} />
        </div>
        <aside className="lg:col-span-4">
          <SectionNav items={toc} label={content('onThisPage')} />
        </aside>
      </div>
    </article>
  );
}
