import { createServer } from 'node:http';

const key = 'studio-notes';
const publishedAt = '2026-11-03T00:00:00.000Z';
let page = null;
let published = null;
let versions = [];

function site(locale) {
  return {
    settings: {
      siteName: 'Studio',
      domain: 'localhost',
      defaultLocale: 'en',
      seoTitle: 'Studio',
      seoDescription: 'Studio pages',
      footerNote: '',
      contactIntro: '',
      replyTimeNote: '',
      contactEmail: '',
      availability: 'OPEN',
      availabilityNote: '',
      analyticsEnabled: false,
      ambientEffects: false,
      marqueeEnabled: false,
      lang: locale,
    },
    profile: {
      displayName: 'Studio',
      legalName: '',
      city: '',
      country: '',
      timezone: 'UTC',
      careerStartDate: '2026-01-01',
      headline: '',
      subheadline: '',
      bio: '',
      languages: '',
      heroKicker: null,
      headlineAccent: null,
      resumeEnId: null,
      resumeViId: null,
      lang: locale,
    },
    nav: { header: [], footer: [] },
    socialLinks: [],
    profileStats: [],
  };
}

function blocks(copy, locale) {
  return [
    {
      id: 1,
      type: 'page-header',
      key: 'page-header',
      layout: 'ONE',
      surface: 'PLAIN',
      props: { eyebrow: '', title: 'Studio notes' },
      lang: locale,
    },
    {
      id: 2,
      type: 'prose',
      key: 'prose',
      layout: 'ONE',
      surface: 'PLAIN',
      props: { body: copy[locale] },
      lang: locale,
    },
  ];
}

function readPage(copy, locale, preview = false) {
  return {
    key,
    seo: { title: 'Studio notes', description: 'Studio page', lang: locale },
    blocks: blocks(copy, locale),
    ...(preview ? { invalidBlocks: [] } : {}),
  };
}

function send(res, status, body) {
  res.writeHead(status, { 'content-type': 'application/json; charset=utf-8' });
  res.end(JSON.stringify(body));
}

async function input(req) {
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  return chunks.length ? JSON.parse(Buffer.concat(chunks).toString('utf8')) : {};
}

async function revalidate() {
  await fetch('http://localhost:3000/api/revalidate', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-revalidate-secret': process.env.REVALIDATE_SECRET ?? '',
    },
    body: JSON.stringify({ tags: [`page:${key}`, 'site'] }),
  });
}

createServer(async (req, res) => {
  try {
    const url = new URL(req.url ?? '/', 'http://127.0.0.1:4000');
    const route = url.pathname;
    const locale = url.searchParams.get('locale') === 'vi' ? 'vi' : 'en';
    const authed = req.headers.cookie?.includes('access_token=mock') ?? false;
    if (route === '/api/health') return send(res, 200, { ok: true });
    if (route === '/api/public/site') return send(res, 200, site(locale));
    if (route === '/api/public/projects')
      return send(res, 200, { items: [], page: 1, pageSize: 100, total: 0 });
    if (route === '/api/public/sitemap')
      return send(res, 200, {
        entries: [
          { path: '/about', updatedAt: publishedAt },
          ...(published ? [{ path: `/${key}`, updatedAt: publishedAt }] : []),
        ],
      });
    if (route === '/api/public/pages/about')
      return send(res, 200, {
        key: 'about',
        seo: { title: 'About', description: 'About the studio', lang: locale },
        blocks: [
          {
            id: 3,
            type: 'page-header',
            key: 'page-header',
            layout: 'ONE',
            surface: 'PLAIN',
            props: { eyebrow: '', title: 'About' },
            lang: locale,
          },
        ],
      });
    if (route === `/api/public/pages/${key}`)
      return published
        ? send(res, 200, readPage(published, locale))
        : send(res, 404, { code: 'NOT_FOUND', message: 'Page not found' });
    if (route === '/api/auth/me')
      return authed
        ? send(res, 200, { id: 1, email: '<email>', name: 'Studio Admin', role: 'admin' })
        : send(res, 401, { code: 'UNAUTHORIZED', message: 'Unauthorized' });
    if (route === `/api/admin/preview/pages/${key}` && authed) {
      const version = Number(url.searchParams.get('version'));
      const copy = version ? versions[version - 1] : page?.copy;
      return copy
        ? send(res, 200, readPage(copy, locale, true))
        : send(res, 404, { code: 'NOT_FOUND', message: 'Page not found' });
    }
    if (route === '/api/admin/pages' && req.method === 'POST' && authed) {
      const body = await input(req);
      if (body.key !== key) return send(res, 400, { code: 'VALIDATION_FAILED' });
      page = { copy: { en: '', vi: '' } };
      published = null;
      versions = [];
      return send(res, 201, {
        key,
        blocks: [
          { id: 1, type: 'page-header', props: {} },
          { id: 2, type: 'prose', props: {} },
        ],
      });
    }
    if (route === `/api/admin/pages/${key}/blocks/2` && req.method === 'PATCH' && authed) {
      const body = await input(req);
      page.copy = body.props.body;
      return send(res, 200, { id: 2 });
    }
    if (route === `/api/admin/pages/${key}/publish` && req.method === 'POST' && authed) {
      published = { ...page.copy };
      versions.push(published);
      await revalidate();
      return send(res, 200, { key, publishedVersion: versions.length });
    }
    send(res, 404, { code: 'NOT_FOUND', message: 'Not found' });
  } catch {
    send(res, 500, { code: 'INTERNAL', message: 'Mock API failed' });
  }
}).listen(4000, '127.0.0.1');
