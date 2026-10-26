import type { PublicBlock, PublicPage, PublicPostDetail, PublicSite } from '@portfolio/contracts';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { buildAlternates } from './alternates.util';
import { fallbackMetadata } from './fallback-metadata.util';
import { firstH1 } from './first-h1.util';
import { escapeJsonLd, personJsonLd } from './json-ld.util';
import { pageMetadata } from './page-metadata.util';
import { postMetadata } from './post-metadata.util';
import { renderRss } from './rss.util';
import { absoluteUrl, localePath, siteUrl } from './site-url.util';
import { firstText, formatTitle } from './title.util';

function sampleSite(over: Partial<PublicSite['settings']> = {}): PublicSite {
  return {
    settings: {
      siteName: 'Parker',
      domain: 'example.test',
      defaultLocale: 'en',
      seoTitle: 'Site title',
      seoDescription: 'Site description',
      footerNote: '',
      contactIntro: '',
      replyTimeNote: '',
      contactEmail: '<email>',
      availability: 'OPEN',
      availabilityNote: '',
      analyticsEnabled: false,
      ambientEffects: false,
      marqueeEnabled: false,
      lang: 'en',
      ...over,
    },
    profile: {
      displayName: 'Parker',
      legalName: 'Parker',
      city: 'Hanoi',
      country: 'Vietnam',
      timezone: 'Asia/Ho_Chi_Minh',
      careerStartDate: '2018-01-01',
      headline: 'Frontend engineer',
      subheadline: '',
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
    profileStats: [],
  };
}

function samplePage(over: Partial<PublicPage> = {}): PublicPage {
  return {
    key: 'projects',
    seo: { title: null, description: null, lang: 'en' },
    blocks: [],
    ...over,
  };
}

function headingBlock(title: string, intro?: string): PublicBlock {
  return {
    id: 1,
    type: 'page-header',
    key: 'header',
    layout: 'ONE',
    surface: 'PLAIN',
    props: { title, intro },
    lang: 'en',
  };
}

describe('formatTitle', () => {
  it('joins seo title and site name', () => {
    expect(formatTitle('Case studies', 'Parker')).toBe('Case studies · Parker');
    expect(formatTitle('Parker', 'Parker')).toBe('Parker');
    expect(formatTitle('', 'Parker')).toBe('Parker');
  });
});

describe('firstText', () => {
  it('skips empty values', () => {
    expect(firstText('', '  ', 'Tagline', 'Site')).toBe('Tagline');
    expect(firstText(null, undefined)).toBeUndefined();
  });
});

describe('firstH1', () => {
  it('reads page-header title and intro, skipping hero', () => {
    expect(
      firstH1([
        {
          id: 1,
          type: 'hero',
          key: 'hero',
          layout: 'ONE',
          surface: 'PLAIN',
          props: { showDiagram: true },
          lang: 'en',
        },
        headingBlock('Selected work', 'A short intro'),
      ]),
    ).toEqual({ title: 'Selected work', intro: 'A short intro' });
  });

  it('reads heading.title from section blocks', () => {
    expect(
      firstH1([
        {
          id: 2,
          type: 'prose',
          key: 'bio',
          layout: 'ONE',
          surface: 'PLAIN',
          props: { heading: { title: 'About', intro: 'Intro' } },
          lang: 'en',
        },
      ]),
    ).toEqual({ title: 'About', intro: 'Intro' });
  });
});

describe('pageMetadata', () => {
  const site = sampleSite();

  it('uses published SEO, then H1, then SiteSettings', () => {
    const seoPage = samplePage({
      seo: { title: 'SEO title', description: 'SEO desc', lang: 'en' },
      blocks: [headingBlock('H1 title', 'H1 intro')],
    });
    expect(pageMetadata({ site, page: seoPage, locale: 'en', path: '/projects' }).title).toBe(
      'SEO title · Parker',
    );
    expect(pageMetadata({ site, page: seoPage, locale: 'en', path: '/projects' }).description).toBe(
      'SEO desc',
    );

    const h1Page = samplePage({ blocks: [headingBlock('H1 title', 'H1 intro')] });
    const h1Meta = pageMetadata({ site, page: h1Page, locale: 'en', path: '/projects' });
    expect(h1Meta.title).toBe('H1 title · Parker');
    expect(h1Meta.description).toBe('H1 intro');

    const empty = pageMetadata({
      site,
      page: samplePage(),
      locale: 'en',
      path: '/projects',
    });
    expect(empty.title).toBe('Site title · Parker');
    expect(empty.description).toBe('Site description');
  });

  it('sets canonical and hreflang', () => {
    const meta = pageMetadata({
      site,
      page: samplePage({ key: 'home' }),
      locale: 'vi',
      path: '/',
    });
    expect(meta.alternates).toEqual(buildAlternates('vi', '/'));
    expect(
      pageMetadata({
        site,
        page: samplePage({ key: 'contact' }),
        locale: 'en',
        path: '/contact',
      }).title,
    ).toBe('Site title · Parker');
  });
});

describe('postMetadata', () => {
  it('falls through seoTitle → title and seoDescription → excerpt → site', () => {
    const site = sampleSite();
    const post = {
      id: 1,
      slug: 'a-note',
      title: 'Note title',
      excerpt: 'Note excerpt',
      readingMinutes: 3,
      isFeatured: false,
      publishedAt: '2026-01-01T00:00:00.000Z',
      tags: [],
      lang: 'en',
      body: 'Body',
      takeaways: [],
      seoTitle: null,
      seoDescription: null,
    } satisfies PublicPostDetail;

    const fromFields = postMetadata({ site, post, locale: 'en' });
    expect(fromFields.title).toBe('Note title · Parker');
    expect(fromFields.description).toBe('Note excerpt');

    const fromSeo = postMetadata({
      site,
      post: { ...post, seoTitle: 'SEO note', seoDescription: 'SEO excerpt' },
      locale: 'en',
    });
    expect(fromSeo.title).toBe('SEO note · Parker');
    expect(fromSeo.description).toBe('SEO excerpt');
  });
});

describe('json-ld', () => {
  it('escapes < so it cannot break out of the script tag', () => {
    expect(escapeJsonLd({ name: '</script><img src=x>' })).toBe(
      '{"name":"\\u003c/script>\\u003cimg src=x>"}',
    );
  });

  it('builds a Person node from the profile', () => {
    const data = personJsonLd(sampleSite());
    expect(data['@type']).toBe('Person');
    expect(data.name).toBe('Parker');
    expect(data.jobTitle).toBe('Frontend engineer');
  });
});

describe('rss', () => {
  it('escapes XML and lists published notes', () => {
    const xml = renderRss({
      title: 'Parker & Co',
      siteUrl: 'http://localhost:3000',
      feedUrl: 'http://localhost:3000/en/rss.xml',
      description: 'Notes <feed>',
      locale: 'en',
      posts: [
        {
          title: 'A <note>',
          slug: 'a-note',
          excerpt: 'Hello & goodbye',
          publishedAt: '2026-01-01T00:00:00.000Z',
        },
      ],
    });
    expect(xml).toContain('<title>Parker &amp; Co</title>');
    expect(xml).toContain('<title>A &lt;note&gt;</title>');
    expect(xml).toContain('Hello &amp; goodbye');
    expect(xml).toContain('http://localhost:3000/en/notes/a-note');
    expect(xml).not.toContain('<note>');
  });
});

describe('site url', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('reads metadataBase from NEXT_PUBLIC_SITE_URL', () => {
    vi.stubEnv('NEXT_PUBLIC_SITE_URL', 'https://parker.test/');
    expect(siteUrl()).toBe('https://parker.test');
    expect(localePath('vi', '/')).toBe('/vi');
    expect(absoluteUrl('en', '/about')).toBe('https://parker.test/en/about');
  });
});

describe('fallbackMetadata', () => {
  it('uses site name when the API is missing a page', () => {
    expect(fallbackMetadata(sampleSite()).title).toBe('Parker');
  });
});
