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
  if (pathname.startsWith('/api/admin/pages/')) {
    const key = pathname.split('/')[4];
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

const server = http.createServer((request, response) => {
  const url = new URL(request.url, 'http://127.0.0.1:4000');
  if (url.pathname === '/api/auth/me' && !request.headers.cookie?.includes('access_token=')) {
    response.writeHead(401, { 'content-type': 'application/json; charset=utf-8' });
    response.end(JSON.stringify({ message: 'Local demo session required' }));
    return;
  }
  const body = fixture(url.pathname);
  response.writeHead(body === null ? 404 : 200, {
    'content-type': 'application/json; charset=utf-8',
    'cache-control': 'no-store',
  });
  response.end(JSON.stringify(body ?? { message: 'Not found' }));
});
server.listen(4000, '127.0.0.1', () => console.log('Local admin demo API ready on 127.0.0.1:4000'));
