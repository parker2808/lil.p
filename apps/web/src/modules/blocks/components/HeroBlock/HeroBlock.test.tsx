import type { PublicBlock, PublicProfileStat, PublicSite } from '@portfolio/contracts';
import { cleanup, render, screen, within } from '@testing-library/react';
import type { ReactNode } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';

const getSite = vi.hoisted(() => vi.fn<() => Promise<PublicSite>>());

vi.mock('@/modules/core/services/site.service', () => ({ getSite }));
vi.mock('@/modules/core/components/HeroStage/HeroStage', () => ({ HeroStage: () => null }));
vi.mock('@i18n/navigation', () => ({
  Link: ({ href, children }: { href: string; children: ReactNode }) => (
    <a href={href}>{children}</a>
  ),
}));

import { HeroBlock } from './HeroBlock';

const block: PublicBlock = {
  id: 1,
  type: 'hero',
  key: 'hero',
  layout: 'ONE',
  surface: 'PLAIN',
  props: {},
  lang: 'en',
};

function profileStat(id: number, value: string, label: string): PublicProfileStat {
  return { id, value, label, suffix: '+', source: 'MANUAL', iconKey: 'sparkles', lang: 'en' };
}

function site(
  heroStats: PublicSite['settings']['heroStats'],
  profileStats: PublicProfileStat[] = [],
): PublicSite {
  return {
    settings: {
      siteName: 'Parker',
      domain: 'example.test',
      defaultLocale: 'en',
      seoTitle: '',
      seoDescription: '',
      footerNote: '',
      contactIntro: '',
      replyTimeNote: '',
      contactEmail: '<email>',
      availability: 'OPEN',
      availabilityNote: '',
      analyticsEnabled: false,
      ambientEffects: false,
      marqueeEnabled: false,
      heroStats,
      lang: 'en',
    },
    profile: {
      displayName: 'Parker',
      legalName: 'Parker',
      city: 'Hanoi',
      country: 'Vietnam',
      timezone: 'Asia/Ho_Chi_Minh',
      careerStartDate: '2021-01-01',
      headline: 'Frontend engineer',
      subheadline: 'Ships product UI',
      bio: '',
      languages: 'English',
      heroKicker: null,
      headlineAccent: null,
      resumeEnId: null,
      resumeViId: null,
      lang: 'en',
    },
    nav: { header: [], footer: [] },
    socialLinks: [],
    profileStats,
  };
}

async function renderHero(value: PublicSite) {
  getSite.mockResolvedValue(value);
  return render(await HeroBlock({ block, context: { locale: 'en' } }));
}

function statPairs(): string[] {
  const list = document.querySelector('dl.hero-stats');
  if (!list) return [];
  return within(list as HTMLElement)
    .getAllByRole('term')
    .map((term) => `${term.textContent}=${term.nextElementSibling?.textContent}`);
}

afterEach(cleanup);

describe('HeroBlock stats', () => {
  it('renders the site settings stats as a description list', async () => {
    await renderHero(
      site(
        [
          { value: '5', suffix: '+', label: 'Years shipping' },
          { value: '12', suffix: null, label: 'Products' },
        ],
        [profileStat(1, '40', 'Ignored')],
      ),
    );

    expect(statPairs()).toEqual(['Years shipping=5+', 'Products=12']);
    expect(screen.getByRole('heading', { name: 'Frontend engineer' })).toBeInTheDocument();
  });

  it('falls back to the first 3 non-zero profile stats when settings stats are null', async () => {
    await renderHero(
      site(null, [
        profileStat(1, '5', 'Years'),
        profileStat(2, '0', 'Zero'),
        profileStat(3, '8', 'Domains'),
        profileStat(4, '30', 'Projects'),
        profileStat(5, '2', 'Fourth'),
      ]),
    );

    expect(statPairs()).toEqual(['Years=5+', 'Domains=8+', 'Projects=30+']);
  });

  it('renders no stats row when settings and profile stats are both empty', async () => {
    const { container } = await renderHero(site([], []));

    expect(container.querySelector('dl')).toBeNull();
  });

  it('omits placeholder values and falls back when no settings stat is left', async () => {
    await renderHero(
      site(
        [
          { value: 'TODO', suffix: null, label: 'Unfinished' },
          { value: '3', suffix: null, label: 'Kept' },
        ],
        [profileStat(1, '5', 'Years')],
      ),
    );
    expect(statPairs()).toEqual(['Kept=3']);

    cleanup();
    await renderHero(
      site([{ value: 'TBD', suffix: null, label: 'Unfinished' }], [profileStat(1, 'TODO', 'X')]),
    );
    expect(document.querySelector('dl')).toBeNull();
  });
});
