import { cloudinaryPreview } from '@portfolio/ui/utils/cloudinary-preview.util';
import type { Locale } from '@portfolio/contracts';
import { ContentProgress } from '@portfolio/ui/components/ContentProgress/ContentProgress';
import { CoverPlaceholder } from '@portfolio/ui/components/CoverPlaceholder/CoverPlaceholder';
import { CtaBand } from '@portfolio/ui/components/CtaBand/CtaBand';
import { FactChips } from '@portfolio/ui/components/FactChips/FactChips';
import { KeyFacts } from '@portfolio/ui/components/KeyFacts/KeyFacts';
import { Button } from '@portfolio/ui/components/ui/button';
import { getTranslations } from 'next-intl/server';
import { notFound } from 'next/navigation';

import { Link } from '@i18n/navigation';

import { JsonLd } from '@/modules/seo/components/JsonLd/JsonLd';
import {
  breadcrumbListJsonLd,
  creativeWorkJsonLd,
  crumbLabel,
} from '@/modules/seo/utils/json-ld.util';
import { absoluteUrl } from '@/modules/seo/utils/site-url.util';

import { CaseStudyHeader } from '../components/CaseStudyHeader/CaseStudyHeader';
import { CaseStudyMeta } from '../components/CaseStudyMeta/CaseStudyMeta';
import { CaseStudySections, caseStudyToc } from '../components/CaseStudySections/CaseStudySections';
import { CaseStudyToc } from '../components/CaseStudyToc/CaseStudyToc';
import { OutcomeStats } from '../components/OutcomeStats/OutcomeStats';
import { PrevNext } from '../components/PrevNext/PrevNext';
import { RelatedProjects } from '../components/RelatedProjects/RelatedProjects';
import { getProjectOrNull, listProjects, listRelatedProjects } from '../services/projects.service';
import { formatPeriod, projectNeighbors } from '../utils/case-study.util';

export async function ProjectsDetail({ locale, slug }: { locale: Locale; slug: string }) {
  const project = await getProjectOrNull(slug, locale);
  if (!project) {
    notFound();
  }

  const [ordered, related, t, blocks, content] = await Promise.all([
    listProjects(locale, { pageSize: 100, sort: 'sortOrder' }),
    listRelatedProjects(locale, project.slug, project.domain?.slug),
    getTranslations('projects'),
    getTranslations('blocks'),
    getTranslations('content'),
  ]);

  const { prev, next } = projectNeighbors(ordered, project.slug);
  const toc = caseStudyToc(project, {
    summary: t('summary'),
    limits: t('limits'),
    scope: t('scope'),
    how: t('how'),
    tradeoffs: t('tradeoffs'),
    result: t('result'),
    retro: t('retro'),
    notMine: t('notMine'),
    released: t('released'),
    notReleased: t('notReleased'),
  });
  const period = formatPeriod(project.startDate, project.endDate, locale, t('now'));
  const stack = project.skills.map((skill) => skill.name).join(' · ');
  const hue = project.domain?.hue ?? 'JADE';
  const crumbs = crumbLabel[locale];

  return (
    <article>
      <JsonLd data={creativeWorkJsonLd(project, locale)} />
      <JsonLd
        data={breadcrumbListJsonLd([
          { name: crumbs.home, url: absoluteUrl(locale, '/') },
          { name: crumbs.projects, url: absoluteUrl(locale, '/projects') },
          { name: project.title, url: absoluteUrl(locale, `/projects/${project.slug}`) },
        ])}
      />
      <ContentProgress />
      <header className="relative overflow-hidden">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            backgroundImage:
              'linear-gradient(var(--grid-line) 1px, transparent 1px), linear-gradient(90deg, var(--grid-line) 1px, transparent 1px)',
            backgroundSize: '3rem 3rem',
            maskImage: 'radial-gradient(ellipse at center, black 40%, transparent 80%)',
          }}
        />
        <div className="relative mx-auto flex max-w-[var(--container)] flex-col gap-10 px-6 py-16">
          <CaseStudyHeader
            project={project}
            labels={{ back: t('back'), nda: blocks('nda'), version: t('version') }}
          />
          <CaseStudyMeta
            items={[
              { label: t('client'), value: project.client },
              { label: t('role'), value: project.role },
              ...(project.teamSize != null
                ? [{ label: t('team'), value: String(project.teamSize) }]
                : []),
              { label: t('period'), value: period },
              ...(stack ? [{ label: t('stack'), value: stack }] : []),
            ]}
          />
        </div>
      </header>
      <div className="mx-auto flex max-w-[var(--container)] flex-col gap-16 px-6 pb-16">
        {project.isConfidential ? null : project.cover ? (
          // Public cover uses API srcset + locale alt (T51); next/image cannot attach srcset.
          // eslint-disable-next-line @next/next/no-img-element -- srcset from media DTO
          <img
            src={project.cover.url}
            srcSet={project.cover.srcset}
            alt={project.cover.alt}
            width={project.cover.width ?? undefined}
            height={project.cover.height ?? undefined}
            sizes="100vw"
            fetchPriority="high"
            decoding="async"
            className="w-full rounded-xl object-cover"
            style={{
              aspectRatio: '21 / 9',
              backgroundImage: cloudinaryPreview(project.cover.url)
                ? `url("${cloudinaryPreview(project.cover.url)}")`
                : undefined,
              backgroundSize: 'cover',
            }}
          />
        ) : (
          <CoverPlaceholder
            title={project.title}
            slug={project.slug}
            hue={hue}
            ratio="21 / 9"
            className="rounded-xl"
          />
        )}
        <div className="grid items-start gap-10 lg:grid-cols-12">
          <aside className="lg:order-2 lg:col-span-4">
            <CaseStudyToc
              items={toc}
              skills={project.skills}
              liveUrl={project.isConfidential ? null : project.liveUrl}
              labels={{ onThisPage: content('onThisPage'), live: t('live') }}
            />
          </aside>
          <div className="flex flex-col gap-12 lg:order-1 lg:col-span-8">
            <KeyFacts facts={project.keyFacts} hue={hue} />
            <OutcomeStats metrics={project.metrics} />
            <CaseStudySections
              project={project}
              labels={{
                summary: t('summary'),
                limits: t('limits'),
                scope: t('scope'),
                how: t('how'),
                tradeoffs: t('tradeoffs'),
                result: t('result'),
                retro: t('retro'),
                notMine: t('notMine'),
                released: t('released'),
                notReleased: t('notReleased'),
              }}
            />
            <FactChips chips={project.factChips} />
          </div>
        </div>
        <RelatedProjects
          heading={project.domain ? t('moreIn', { name: project.domain.name }) : t('more')}
          projects={related}
          nda={blocks('nda')}
        />
        <PrevNext prev={prev} next={next} labels={{ previous: t('previous'), next: t('next') }} />
        <CtaBand
          title={t('ctaTitle')}
          intro={t('ctaIntro')}
          iconKey="mail"
          actions={
            <Button surface="public" asChild>
              <Link href="/contact">{t('ctaAction')}</Link>
            </Button>
          }
        />
      </div>
    </article>
  );
}
