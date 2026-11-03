import http from 'node:http';

// Fictional, process-local data for production-build screenshots. No database is used.
const now = '2026-11-02T12:00:00.000Z';
const svg = `data:image/svg+xml,${encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="640" height="360"><rect width="640" height="360" fill="#183c30"/><circle cx="440" cy="100" r="100" fill="#ed793e"/><path d="M0 290 Q320 120 640 300 V360 H0" fill="#4a8d6b"/></svg>')}`;
const education = [
  {
    id: 1,
    school: 'Institute of Visual Systems',
    degreeEn: 'Design and interaction',
    degreeVi: 'Thiết kế và tương tác',
    majorEn: 'Digital products',
    majorVi: 'Sản phẩm số',
    startDate: '2020-01-01',
    endDate: '2024-01-01',
    sortOrder: 0,
    isVisible: true,
    updatedAt: now,
  },
  {
    id: 2,
    school: 'Open Studio Academy',
    degreeEn: 'Continuing study in accessible interfaces',
    degreeVi: 'Nghiên cứu giao diện dễ tiếp cận',
    majorEn: 'Interface systems',
    majorVi: 'Hệ thống giao diện',
    startDate: '2018-01-01',
    endDate: '2020-01-01',
    sortOrder: 1,
    isVisible: true,
    updatedAt: now,
  },
];
const media = [1, 2, 3, 4].map((id) => ({
  id,
  fileName: `demo-${id}.svg`,
  originalName: `Cosmic study ${id}.svg`,
  mimeType: 'image/svg+xml',
  sizeBytes: 250,
  width: 640,
  height: 360,
  altEn: `Abstract study ${id}`,
  altVi: `Tranh trừu tượng ${id}`,
  resourceType: 'image',
  uploadedById: 1,
  url: svg,
  srcset: '',
  createdAt: now,
}));
const pageKeys = ['home', 'about', 'craft'];
const pages = pageKeys.map((key) => ({
  key,
  title: key === 'craft' ? 'Craft' : null,
  locale: 'en',
  blockCount: 0,
  updatedAt: now,
  publishedVersion: key === 'craft' ? null : 1,
  publishedAt: key === 'craft' ? null : now,
  hasUnpublishedChanges: key === 'craft',
}));
const createdPages = new Map();
let nextBlockId = 100;

function isSubstantive(copy) {
  const prose = (copy ?? '')
    .replace(/!\[[^\]]*\]\([^)]*\)/g, '')
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1');
  return (prose.match(/\p{L}/gu)?.length ?? 0) >= 12;
}

function previewPage(key, locale) {
  const detail = createdPages.get(key);
  if (!detail) return { status: 404, body: { code: 'NOT_FOUND', message: 'Page not found' } };
  const lang = locale === 'vi' ? 'vi' : 'en';
  return {
    status: 200,
    body: {
      key,
      seo: {
        title: detail[`seoTitle${lang === 'vi' ? 'Vi' : 'En'}`] ?? detail.title,
        description: null,
        lang,
      },
      blocks: detail.blocks
        .filter((block) => block.isVisible)
        .map((block) => ({
          id: block.id,
          type: block.type,
          key: block.key,
          layout: block.layout,
          surface: block.surface,
          lang,
          props: Object.fromEntries(
            Object.entries(block.props).map(([name, value]) => [
              name,
              value && typeof value === 'object' && 'en' in value
                ? value[lang] || value[detail.locale] || ''
                : value,
            ]),
          ),
        })),
      invalidBlocks: [],
    },
  };
}

function updateBlock(key, id, body) {
  const detail = createdPages.get(key);
  const block = detail?.blocks.find((item) => item.id === id);
  if (!block) return { status: 404, body: { code: 'NOT_FOUND', message: 'Block not found' } };
  if (
    !body?.props ||
    typeof body.props !== 'object' ||
    (block.type === 'prose' &&
      (typeof body.props.body?.en !== 'string' || typeof body.props.body?.vi !== 'string'))
  ) {
    return {
      status: 400,
      body: {
        code: 'VALIDATION_FAILED',
        message: 'Validation failed',
        fieldErrors: { props: ['Invalid block props'] },
      },
    };
  }
  block.props = body.props;
  block.updatedAt = new Date().toISOString();
  detail.updatedAt = block.updatedAt;
  detail.hasUnpublishedChanges = true;
  return { status: 200, body: block };
}

function publishPage(key) {
  const detail = createdPages.get(key);
  if (!detail) return { status: 404, body: { code: 'NOT_FOUND', message: 'Page not found' } };
  const fields = {};
  const visibleProse = detail.blocks.filter((block) => block.isVisible && block.type === 'prose');
  const hasBody = visibleProse.some((block) => isSubstantive(block.props.body?.[detail.locale]));
  for (const block of visibleProse) {
    if (!isSubstantive(block.props.body?.[detail.locale])) {
      fields[`block:${block.key}.body.${detail.locale}`] = [
        'Enter substantive body copy before publishing',
      ];
    }
  }
  if (!hasBody) fields.body = ['Add visible body copy before publishing'];
  if (Object.keys(fields).length) {
    return {
      status: 400,
      body: { code: 'VALIDATION_FAILED', message: 'Validation failed', fieldErrors: fields },
    };
  }
  detail.publishedVersion = (detail.publishedVersion ?? 0) + 1;
  detail.publishedAt = new Date().toISOString();
  detail.hasUnpublishedChanges = false;
  const listItem = pages.find((item) => item.key === key);
  if (listItem) {
    listItem.publishedVersion = detail.publishedVersion;
    listItem.publishedAt = detail.publishedAt;
    listItem.hasUnpublishedChanges = false;
  }
  return { status: 200, body: detail };
}

function createPage(body) {
  const fields = {};
  if (typeof body?.title !== 'string' || !body.title.trim() || body.title.length > 120) {
    fields.title = ['Title is required'];
  }
  if (
    typeof body?.key !== 'string' ||
    !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(body.key) ||
    body.key.length > 64
  ) {
    fields.key = ['Invalid page slug'];
  }
  if (!['en', 'vi'].includes(body?.locale)) fields.locale = ['Invalid locale'];
  if (!['starter', 'empty'].includes(body?.template)) fields.template = ['Invalid template'];
  if (Object.keys(fields).length) {
    return {
      status: 400,
      body: { code: 'VALIDATION_FAILED', message: 'Validation failed', fieldErrors: fields },
    };
  }
  if (
    ['home', 'about', 'projects', 'notes', 'contact', 'craft'].includes(body.key) ||
    pages.some((item) => item.key === body.key) ||
    createdPages.has(body.key)
  ) {
    return {
      status: 409,
      body: { code: 'PAGE_KEY_TAKEN', message: 'Page slug is already in use' },
    };
  }
  const title = body.title.trim();
  const localizedTitle = {
    en: body.locale === 'en' ? title : '',
    vi: body.locale === 'vi' ? title : '',
  };
  const blocks =
    body.template === 'starter'
      ? [
          {
            id: nextBlockId++,
            type: 'page-header',
            key: 'page-header',
            layout: 'ONE',
            surface: 'PLAIN',
            schemaVersion: 1,
            props: { title: localizedTitle },
            isVisible: true,
            sortOrder: 0,
            updatedAt: now,
          },
          {
            id: nextBlockId++,
            type: 'prose',
            key: 'prose',
            layout: 'ONE',
            surface: 'PLAIN',
            schemaVersion: 1,
            props: { body: { en: '', vi: '' } },
            isVisible: true,
            sortOrder: 1,
            updatedAt: now,
          },
        ]
      : [];
  const detail = {
    key: body.key,
    title,
    locale: body.locale,
    seoTitleEn: body.locale === 'en' ? title : null,
    seoTitleVi: body.locale === 'vi' ? title : null,
    seoDescriptionEn: null,
    seoDescriptionVi: null,
    updatedAt: now,
    publishedVersion: null,
    publishedAt: null,
    hasUnpublishedChanges: true,
    blocks,
  };
  createdPages.set(body.key, detail);
  pages.push({
    key: body.key,
    title,
    locale: body.locale,
    blockCount: blocks.length,
    updatedAt: now,
    publishedVersion: null,
    publishedAt: null,
    hasUnpublishedChanges: true,
  });
  return { status: 201, body: detail };
}
const project = {
  id: 1,
  slug: 'demo-project',
  titleEn: 'Atlas interface',
  titleVi: 'Giao diện Atlas',
  taglineEn: 'A calmer way to navigate complex work',
  taglineVi: 'Cách rõ ràng hơn để xử lý công việc phức tạp',
  client: 'Demo studio',
  roleEn: 'Product designer',
  roleVi: 'Thiết kế sản phẩm',
  teamSize: 3,
  startDate: '2024-01-01',
  endDate: null,
  versionFrom: null,
  versionTo: null,
  isFeatured: true,
  isConfidential: false,
  liveUrl: null,
  repoUrl: null,
  problemEn: '',
  problemVi: '',
  constraintsEn: '',
  constraintsVi: '',
  approachEn: '',
  approachVi: '',
  decisionsEn: '',
  decisionsVi: '',
  outcomeEn: '',
  outcomeVi: '',
  lessonsEn: '',
  lessonsVi: '',
  keyFactsEn: '',
  keyFactsVi: '',
  factChipsEn: '',
  factChipsVi: '',
  notMineEn: null,
  notMineVi: null,
  releaseStatus: null,
  seoTitleEn: null,
  seoTitleVi: null,
  seoDescriptionEn: null,
  seoDescriptionVi: null,
  status: 'DRAFT',
  publishedAt: null,
  sortOrder: 0,
  coverId: null,
  cover: null,
  domainId: null,
  experienceId: null,
  skillIds: [],
  metrics: [],
  images: [],
  updatedAt: now,
};
const post = {
  id: 1,
  slug: 'demo-note',
  titleEn: 'Notes on clear interfaces',
  titleVi: 'Ghi chú về giao diện rõ ràng',
  excerptEn: '',
  excerptVi: '',
  bodyEn: '',
  bodyVi: '',
  takeawaysEn: '',
  takeawaysVi: '',
  seoTitleEn: null,
  seoTitleVi: null,
  seoDescriptionEn: null,
  seoDescriptionVi: null,
  readingMinutes: 3,
  isFeatured: false,
  status: 'DRAFT',
  publishedAt: null,
  sortOrder: 0,
  coverId: null,
  cover: null,
  tagIds: [],
  updatedAt: now,
};
const experience = {
  id: 1,
  company: 'Demo studio',
  companyUrl: null,
  location: 'Remote',
  employmentType: 'FULL_TIME',
  roleEn: 'Product designer',
  roleVi: 'Thiết kế sản phẩm',
  summaryEn: '',
  summaryVi: '',
  highlightsEn: '',
  highlightsVi: '',
  startDate: '2024-01-01',
  endDate: null,
  sortOrder: 0,
  isVisible: true,
  skillIds: [],
  updatedAt: now,
};
const message = {
  id: 1,
  name: 'Demo sender',
  email: '',
  topicId: null,
  topic: null,
  message: 'A fictional message for the local inbox preview.',
  locale: 'en',
  status: 'READ',
  createdAt: now,
  updatedAt: now,
};
const page = (items) => ({ items, page: 1, pageSize: 20, total: items.length });
const counts = { draft: 2, published: 5, archived: 0, publishedInRange: 1, publishedInPrevious: 1 };
const views = {
  total: 120,
  uniqueVisitors: 80,
  previousTotal: 95,
  previousUnique: 70,
  byDay: [],
  topPages: [],
  topReferrers: [],
};
const healthSummary = {
  drafts: 2,
  missingVi: 0,
  noDomain: 0,
  fewKeyFacts: 0,
  marqueeCount: 0,
  publishLint: 0,
  missingAlt: 0,
  neverPublished: 1,
  staleDrafts: 0,
  invalidPageBlocks: 0,
  brokenRefs: 0,
};

function fixture(pathname) {
  if (pathname === '/api/auth/me') return { id: 1, email: '', name: 'Parker', role: 'admin' };
  // Keep public prerendering in its API-unavailable path during a web build.
  if (pathname === '/api/health') return null;
  if (pathname === '/api/public/site')
    return {
      settings: {
        siteName: 'Demo portfolio',
        domain: 'example.test',
        defaultLocale: 'en',
        seoTitle: 'Demo portfolio',
        seoDescription: '',
        footerNote: '',
        contactIntro: '',
        replyTimeNote: '',
        contactEmail: '',
        availability: 'OPEN',
        availabilityNote: '',
        analyticsEnabled: false,
        ambientEffects: false,
        marqueeEnabled: false,
        ogImage: null,
        heroStats: null,
        lang: 'en',
      },
      profile: {
        displayName: 'Parker',
        legalName: 'Parker',
        city: 'Demo City',
        country: 'Demo Country',
        timezone: 'UTC',
        careerStartDate: '2020-01-01',
        headline: 'Designing digital experiences',
        subheadline: '',
        bio: '',
        languages: 'English',
        heroKicker: null,
        headlineAccent: null,
        resumeEnId: null,
        resumeViId: null,
        avatar: null,
        resume: null,
        lang: 'en',
      },
      nav: { header: [], footer: [] },
      socialLinks: [],
      profileStats: [],
    };
  if (pathname === '/api/admin/education') return education;
  if (pathname === '/api/admin/profile')
    return {
      id: 1,
      displayName: 'Parker',
      legalName: 'Parker',
      city: 'Demo City',
      country: 'Demo Country',
      timezone: 'UTC',
      careerStartDate: '2020-01-01',
      headlineEn: 'Designing digital experiences',
      headlineVi: 'Thiết kế trải nghiệm số',
      subheadlineEn: '',
      subheadlineVi: '',
      bioEn: '',
      bioVi: '',
      languagesEn: 'English',
      languagesVi: 'Tiếng Việt',
      heroKickerEn: null,
      heroKickerVi: null,
      headlineAccentEn: null,
      headlineAccentVi: null,
      avatarId: null,
      avatar: null,
      resumeEnId: null,
      resumeViId: null,
      resumeEn: null,
      resumeVi: null,
      phone: null,
      updatedAt: now,
    };
  if (pathname === '/api/admin/media') return { items: media, nextCursor: null };
  if (pathname === '/api/admin/pages') return pages;
  if (pathname === '/api/admin/projects')
    return page([
      {
        id: 1,
        slug: project.slug,
        titleEn: project.titleEn,
        titleVi: project.titleVi,
        status: project.status,
        isFeatured: true,
        domainId: null,
        updatedAt: now,
        keyFactsCount: 0,
        domain: null,
      },
    ]);
  if (pathname === '/api/admin/projects/1') return project;
  if (pathname === '/api/admin/posts')
    return page([
      {
        id: 1,
        slug: post.slug,
        titleEn: post.titleEn,
        titleVi: post.titleVi,
        status: post.status,
        isFeatured: false,
        readingMinutes: 3,
        publishedAt: null,
        updatedAt: now,
        tags: [],
      },
    ]);
  if (pathname === '/api/admin/posts/1') return post;
  if (pathname === '/api/admin/experience') return page([experience]);
  if (pathname === '/api/admin/experience/1') return experience;
  if (pathname === '/api/admin/messages') return page([message]);
  if (pathname === '/api/admin/messages/1') return message;
  if (pathname === '/api/admin/messages/unread-count') return { unread: 0 };
  if (pathname.startsWith('/api/admin/preview/pages/')) {
    return null;
  }
  if (pathname.startsWith('/api/admin/pages/')) {
    const key = pathname.split('/')[4];
    if (pathname.endsWith('/versions')) return [];
    if (createdPages.has(key)) return createdPages.get(key);
    return {
      ...pages.find((item) => item.key === key),
      key,
      seoTitleEn: key === 'craft' ? 'Craft' : 'Demo page',
      seoTitleVi: null,
      seoDescriptionEn: null,
      seoDescriptionVi: null,
      updatedAt: now,
      publishedVersion: null,
      publishedAt: null,
      hasUnpublishedChanges: true,
      blocks: [],
    };
  }
  if (pathname === '/api/admin/stats')
    return { range: '30d', projects: counts, posts: counts, messages: { unread: 0 }, views };
  if (pathname === '/api/admin/health') return { summary: healthSummary, issues: [] };
  if (pathname === '/api/admin/audit' || pathname === '/api/admin/media')
    return { items: [], nextCursor: null };
  if (/^\/api\/admin\/(projects|posts|experience|users|inbox)$/.test(pathname))
    return { items: [], total: 0, page: 1, pageSize: 20, nextCursor: null };
  if (pathname.startsWith('/api/admin/')) return [];
  return null;
}

const server = http.createServer(async (request, response) => {
  const url = new URL(request.url, 'http://127.0.0.1:4000');
  if (url.pathname === '/api/auth/me' && !request.headers.cookie?.includes('access_token=')) {
    response.writeHead(401, { 'content-type': 'application/json; charset=utf-8' });
    response.end(JSON.stringify({ message: 'Local demo session required' }));
    return;
  }
  let result;
  const blockPath = url.pathname.match(/^\/api\/admin\/pages\/([^/]+)\/blocks\/(\d+)$/);
  const publishPath = url.pathname.match(/^\/api\/admin\/pages\/([^/]+)\/publish$/);
  const previewPath = url.pathname.match(/^\/api\/admin\/preview\/pages\/([^/]+)$/);
  if (request.method === 'GET' && url.pathname === '/api/public/pages/demo-error') {
    result = { status: 503, body: { code: 'INTERNAL', message: 'Demo API unavailable' } };
  } else if (request.method === 'POST' && publishPath) {
    result = publishPage(publishPath[1]);
  } else if (request.method === 'GET' && previewPath) {
    result = previewPage(previewPath[1], url.searchParams.get('locale'));
  } else if (
    (url.pathname === '/api/admin/pages' && request.method === 'POST') ||
    (blockPath && request.method === 'PATCH')
  ) {
    let raw = '';
    for await (const chunk of request) raw += chunk;
    try {
      const body = JSON.parse(raw);
      result = blockPath ? updateBlock(blockPath[1], Number(blockPath[2]), body) : createPage(body);
    } catch {
      result = {
        status: 400,
        body: {
          code: 'VALIDATION_FAILED',
          message: 'Validation failed',
          fieldErrors: { body: ['Invalid JSON'] },
        },
      };
    }
  } else if (request.method === 'GET') {
    const body = fixture(url.pathname);
    result = { status: body === null ? 404 : 200, body: body ?? { message: 'Not found' } };
  } else {
    result = { status: 404, body: { message: 'Not found' } };
  }
  response.writeHead(result.status, {
    'content-type': 'application/json; charset=utf-8',
    'cache-control': 'no-store',
  });
  response.end(JSON.stringify(result.body));
});
server.listen(4000, '127.0.0.1', () => console.log('Local admin demo API ready on 127.0.0.1:4000'));
