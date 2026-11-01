import type { pagesData } from './pages.data';
import type { PortfolioJson } from './portfolio.mapper';

/**
 * Approved owner About copy and public names (2026-11-01), applied on top of
 * `portfolio-data.json` by the owner seed only. The JSON and `pagesData` stay
 * unchanged because they feed the frozen `20261027150000_portfolio_content`
 * migration.
 */

type Row = Record<string, unknown>;
type SeedPage = (typeof pagesData)[number];
type SeedBlock = SeedPage['blocks'][number];

export const AI_AGENTS_BLOCK_KEY = 'building-with-ai-agents';

const BIO_EN = `I'm Parker, a frontend developer in Hanoi with 5+ years of shipping Vue, Nuxt and TypeScript products for clients in Korea, the US, the UK and Thailand. I started in 2021 as a fullstack developer on Store Migrator, a cart data migration tool (Flask, Laravel, Vue 2), then moved to frontend: Ticket Hub and Ops Console for a Korean enterprise client at CMC Global, Asset Rating Platform at Kobizo, and back-office and sales portals for a Thai retail group. These days I also build NestJS backends and React/Next.js on my own projects.

## What I'm proud of

- At Kobizo I led Asset Rating Platform's move from Vue 2 to Nuxt 3, cutting the legacy code from 70 modules to 11 (about 42.5k lines removed); I was the top committer on the repo.
- On Data Verification Back Office I built field verification controls for 205 fields in 16 groups, and on Field Sales CRM an iPad route review screen for sales reps.
- On the side I built lil.p, the site you're reading, which doubles as a full bilingual CMS, plus a senior frontend interview study site.

## How I work

I migrate in slices, one module at a time, so the app always ships. I write conventions down so the team can follow them. I never let a form lose what the user typed. I prefer small PRs with green CI, test on mobile first, and work alongside AI coding agents every day.`;

const BIO_VI = `Mình là Parker, frontend developer ở Hà Nội, hơn 5 năm làm sản phẩm với Vue, Nuxt và TypeScript cho khách hàng Hàn Quốc, Mỹ, Anh và Thái Lan. Mình bắt đầu năm 2021 với vai trò fullstack trên Store Migrator, công cụ chuyển dữ liệu giữa các nền tảng bán hàng, rồi chuyển hẳn sang frontend: Ticket Hub và Ops Console cho một khách hàng doanh nghiệp Hàn Quốc ở CMC Global, Asset Rating Platform ở Kobizo, và các cổng quản trị, bán hàng cho một tập đoàn bán lẻ Thái Lan. Mình thích chia những đợt migration lớn thành từng phần nhỏ, viết rõ quy ước cho team, và không bao giờ để form làm mất dữ liệu người dùng đã nhập.

## Điều mình tự hào

- Ở Kobizo, mình dẫn dắt việc chuyển Asset Rating Platform từ Vue 2 sang Nuxt 3, giảm code cũ từ 70 module xuống 11 (bỏ khoảng 42.5k dòng); mình cũng là người commit nhiều nhất trong repo.
- Ở Data Verification Back Office, mình xây phần cấu hình xác minh cho 205 trường dữ liệu trong 16 nhóm; ở Field Sales CRM, mình làm màn hình duyệt lộ trình trên iPad cho nhân viên bán hàng.
- Ngoài giờ, mình làm lil.p, chính trang bạn đang đọc, đồng thời là một CMS song ngữ đầy đủ, cùng một trang ôn luyện phỏng vấn senior frontend.

## Cách mình làm việc

Mình migrate theo từng phần, mỗi lần một module, để app lúc nào cũng release được. Mình viết quy ước ra để cả team cùng theo. Mình không bao giờ để form làm mất những gì người dùng đã nhập. Mình thích PR nhỏ với CI xanh, test trên mobile trước, và làm việc cùng AI coding agent mỗi ngày.`;

const AI_AGENTS_EN = `I run my own multi-agent setup: several AI assistants, each owning a project, coordinated by an admin bot and backed by a shared private memory of rules and context. Coding agents (Codex, Cursor and free models) run on my Mac through T3 Code, with automatic model switching when a quota runs out, a watchdog that resumes queued work after drops, and budget-aware routing so free models take small tasks and paid ones take hard ones. Work ships as small stacked PRs with green CI and English-only specs. That's how lil.p went from 43 planned UI/UX tasks to merged code in a few days, while I review and decide.`;

const AI_AGENTS_VI = `Mình tự dựng một hệ thống nhiều AI agent: mỗi bot phụ trách một dự án, có một bot admin điều phối, và tất cả dùng chung một bộ nhớ riêng chứa quy tắc và ngữ cảnh. Các agent viết code (Codex, Cursor và các model miễn phí) chạy trên Mac qua T3 Code. Khi một model hết quota, hệ thống tự chuyển sang model khác, có watchdog tự chạy lại việc đang chờ khi mất kết nối, và việc được chia theo ngân sách: model miễn phí làm việc nhỏ, model trả phí làm việc khó. Code ra từng PR nhỏ xếp chồng, CI phải xanh, spec viết bằng tiếng Anh. Nhờ vậy 43 task UI/UX của lil.p được làm xong và merge trong vài ngày, còn mình chỉ review và quyết định.`;

const SIDE_PROJECTS_EN = `- **lil.p**: This portfolio, which is also a full bilingual CMS (Next.js + NestJS), running on free tiers (Vercel, Render, TiDB, Cloudinary). Built largely by AI agents through stacked PRs with green CI; 43 UI/UX tasks went from plan to merged in a few days. [Live site](https://lil-p.vercel.app) · [Source on GitHub](https://github.com/parker2808/lil.p)
- **Senior FE Interview Kit**: A Nuxt 3 study site with a knowledge base, a 30-day plan and PIN-protected Q&A in VI/EN. Content lives in a separate data repo. 22 topics, 142 Q&A.
- **Birthday Story**: A personal gift site: a 15-step, phone-style story in VI/EN with a countdown. Its overlap test suite runs 2,880 cases with 0 failures.
- **Agent Memory**: A private shared memory and rules repo that powers my multi-agent setup: common rules, a token-saving flow, per-bot context and recovery scripts (watchdog, launchd) that keep agents running unattended. See [Building with AI agents](#${AI_AGENTS_BLOCK_KEY}).`;

const SIDE_PROJECTS_VI = `- **lil.p**: Chính trang portfolio này, đồng thời là một CMS song ngữ đầy đủ (Next.js + NestJS), chạy hoàn toàn trên gói miễn phí (Vercel, Render, TiDB, Cloudinary). Phần lớn do AI agent làm qua các PR nhỏ xếp chồng, CI luôn xanh; 43 task UI/UX đi từ kế hoạch tới merge chỉ trong vài ngày. [Trang web](https://lil-p.vercel.app) · [Mã nguồn trên GitHub](https://github.com/parker2808/lil.p)
- **Senior FE Interview Kit**: Trang ôn luyện viết bằng Nuxt 3, có kho kiến thức, lộ trình 30 ngày và phần hỏi đáp VI/EN khoá bằng mã PIN. Nội dung nằm ở một repo dữ liệu riêng. 22 chủ đề, 142 câu hỏi đáp.
- **Birthday Story**: Một trang web làm quà tặng: câu chuyện 15 bước theo kiểu màn hình điện thoại, song ngữ VI/EN, có đếm ngược. Bộ test chồng lấn chạy 2.880 trường hợp, 0 lỗi.
- **Agent Memory**: Một repo riêng tư chứa bộ nhớ và quy tắc dùng chung cho hệ thống nhiều agent của mình: quy tắc chung, quy trình tiết kiệm token, ngữ cảnh cho từng bot và các script phục hồi (watchdog, launchd) để agent chạy liên tục khi không có người trông. Xem mục [Làm việc cùng AI agent](#${AI_AGENTS_BLOCK_KEY}).`;

const PROFILE: Row = {
  headlineEn: 'I move products forward without breaking them.',
  headlineVi: 'Mình đưa sản phẩm tiến lên mà không làm nó vỡ.',
  headlineAccentEn: 'without breaking them.',
  headlineAccentVi: 'mà không làm nó vỡ.',
  bioEn: BIO_EN,
  bioVi: BIO_VI,
  languagesEn: 'Vietnamese (native), English (working proficiency)',
  languagesVi: 'Tiếng Việt (bản ngữ), tiếng Anh (đủ dùng trong công việc)',
};

const EXPERIENCE: Record<string, Row> = {
  'cmc-cfw': {
    clientNote: null,
    startDate: '2026-01',
    endDate: null,
    roleEn: 'Fullstack Developer',
    roleVi: 'Fullstack Developer',
    summaryEn:
      'Fleet Platform, a NestJS backend (from 01/2026), and back-office and sales portals for a Thai retail group (from 07/2026).',
    summaryVi:
      'Fleet Platform, backend NestJS (từ 01/2026), và các cổng quản trị, bán hàng cho một tập đoàn bán lẻ Thái Lan (từ 07/2026).',
    highlightsEn:
      '- Data Verification Back Office: field verification controls for 205 fields in 16 groups.\n- Field Sales CRM: an iPad route review screen for sales reps.',
    highlightsVi:
      '- Data Verification Back Office: cấu hình xác minh cho 205 trường dữ liệu trong 16 nhóm.\n- Field Sales CRM: màn hình duyệt lộ trình trên iPad cho nhân viên bán hàng.',
  },
  kobizo: {
    roleEn: 'Frontend Developer',
    roleVi: 'Frontend Developer',
    summaryEn:
      'Main frontend developer on Asset Rating Platform, a rating and analytics platform for tokenized real-world assets.',
    summaryVi:
      'Frontend chính của Asset Rating Platform, nền tảng rating và phân tích cho tài sản thực được token hóa.',
    highlightsEn:
      '- Led the move from Vue 2 to Nuxt 3, cutting the legacy code from 70 modules to 11 (about 42.5k lines removed).\n- Top committer on the repo.',
    highlightsVi:
      '- Dẫn dắt việc chuyển từ Vue 2 sang Nuxt 3, giảm code cũ từ 70 module xuống 11 (bỏ khoảng 42.5k dòng).\n- Người commit nhiều nhất trong repo.',
  },
  'cmc-samsung': {
    clientNote: null,
    summaryEn:
      'Frontend on Ticket Hub and Ops Console for a Korean enterprise client, working with a Korean team.',
    summaryVi:
      'Làm frontend cho Ticket Hub và Ops Console của một khách hàng doanh nghiệp Hàn Quốc, làm việc cùng team Hàn Quốc.',
  },
  'litgroup-fe': {
    summaryEn:
      'Frontend for Store Migrator, a cart data migration tool used by US and UK store owners.',
    summaryVi:
      'Làm frontend cho Store Migrator, công cụ chuyển dữ liệu bán hàng, khách hàng ở Mỹ và Anh.',
  },
  'litgroup-be': {
    summaryEn: 'Backend for Store Migrator, with Flask and Laravel.',
    summaryVi: 'Làm backend cho Store Migrator, bằng Flask và Laravel.',
  },
};

const KOREAN_CLIENT = 'A Korean enterprise client, via CMC Global';
const THAI_CLIENT = 'A Thai retail group, via CMC Global';

const PROJECTS: Record<string, Row> = {
  particula: {
    titleEn: 'Asset Rating Platform',
    titleVi: 'Asset Rating Platform',
    client: 'Kobizo',
  },
  'cfw-back-office-field-config': {
    titleEn: 'Data Verification Back Office: customer field verification',
    titleVi: 'Data Verification Back Office: xác minh field khách hàng',
    client: THAI_CLIENT,
  },
  'cfw-sales-crm': {
    titleEn: 'Field Sales CRM: visit routes and AI recommendations',
    titleVi: 'Field Sales CRM: tuyến viếng thăm và AI recommendation',
    client: THAI_CLIENT,
  },
  'msp-advanced': {
    titleEn: 'Ops Console',
    titleVi: 'Ops Console',
    taglineEn: 'Moved logic from Ticket Hub into a new product with a fresh design.',
    taglineVi: 'Chuyển logic từ Ticket Hub sang sản phẩm mới, kèm thiết kế mới.',
    client: KOREAN_CLIENT,
  },
  'msp-app-expansion': {
    titleEn: 'Ticket Hub',
    titleVi: 'Ticket Hub',
    taglineEn: "Frontend for the client's tool to handle request issues coming from Jira.",
    taglineVi: 'Frontend cho tool của khách hàng xử lý các request issue đến từ Jira.',
    client: KOREAN_CLIENT,
  },
  'migration-data-tool': { titleEn: 'Store Migrator', titleVi: 'Store Migrator' },
  'ctrack-crystal': { titleEn: 'Fleet Platform', titleVi: 'Fleet Platform' },
  'lil-j-birthday-site': {
    titleEn: 'Birthday Story',
    titleVi: 'Birthday Story',
    client: 'Personal project',
    liveUrl: null,
    repoUrl: null,
    outcomeEn:
      'A 15-step, phone-style story in VI/EN with a countdown that resumes after refresh. Its overlap test suite runs 2,880 cases with 0 failures. Fallbacks for music, motion and the candle mic.',
    outcomeVi:
      'Câu chuyện 15 bước theo kiểu màn hình điện thoại, song ngữ VI/EN, có đếm ngược, tải lại vẫn tiếp tục. Bộ test chồng lấn chạy 2.880 trường hợp, 0 lỗi. Có fallback cho nhạc, chuyển động và mic thổi nến.',
  },
  'interview-senior-fe': {
    titleEn: 'Senior FE Interview Kit',
    titleVi: 'Senior FE Interview Kit',
    client: 'Personal project',
    liveUrl: null,
    repoUrl: null,
  },
  'lil-p': { liveUrl: 'https://lil-p.vercel.app' },
};

function patchRow(rows: Row[], field: string, value: unknown, patch: Row): void {
  const row = rows.find((item) => item[field] === value);
  if (!row) {
    throw new Error(`Owner copy: no row with ${field} = ${String(value)}`);
  }
  Object.assign(row, patch);
}

/** Returns a copy of the owner data with the approved About copy and public names. */
export function applyOwnerCopy(source: PortfolioJson): PortfolioJson {
  const data = structuredClone(source);
  Object.assign(data.profile, PROFILE);

  for (const [key, patch] of Object.entries(EXPERIENCE)) {
    patchRow(data.experience, 'key', key, patch);
  }
  const fleet = data.experience.find((row) => row.key === 'cmc-cfw');
  const fleetSkills = Array.isArray(fleet?.skills) ? (fleet.skills as string[]) : [];
  if (fleet && !fleetSkills.includes('nestjs')) {
    fleet.skills = [...fleetSkills, 'nestjs'];
  }

  for (const [slug, patch] of Object.entries(PROJECTS)) {
    patchRow(data.projects, 'slug', slug, patch);
  }
  const assetRating = data.projects.find((row) => row.slug === 'particula');
  for (const field of ['problemEn', 'problemVi']) {
    if (assetRating && typeof assetRating[field] === 'string') {
      assetRating[field] = assetRating[field].replaceAll('Particula', 'Asset Rating Platform');
    }
  }

  patchRow(data.profileStats, 'labelEn', 'Enterprise platform (Samsung SDS)', {
    labelEn: 'Platform for a Korean enterprise client',
    labelVi: 'Platform cho một khách hàng doanh nghiệp Hàn Quốc',
  });
  patchRow(
    data.domains,
    'descriptionEn',
    'Internal tools for large companies: Samsung SDS, Central Food Wholesale.',
    {
      descriptionEn:
        'Internal tools for large companies: a Korean enterprise client and a Thai retail group.',
      descriptionVi:
        'Tool nội bộ cho doanh nghiệp lớn: một khách hàng doanh nghiệp Hàn Quốc và một tập đoàn bán lẻ Thái Lan.',
    },
  );

  const workflowOrder = data.skills
    .filter((row) => row.category === 'workflow')
    .map((row) => (typeof row.sortOrder === 'number' ? row.sortOrder : 0));
  data.skills.push({
    name: 'Multi-agent AI workflow',
    slug: 'multi-agent-ai-workflow',
    category: 'workflow',
    depth: 'DAILY',
    showInMarquee: false,
    sortOrder: Math.max(-1, ...workflowOrder) + 1,
    isVisible: true,
  });

  // The bio now has its own "How I work" section.
  const principles = data.pageSections.find(
    (section) => section.page === 'ABOUT' && section.key === 'principles',
  );
  if (principles) {
    principles.titleEn = 'Principles';
    principles.titleVi = 'Nguyên tắc';
  }
  return data;
}

function proseBlock(
  key: string,
  title: { en: string; vi: string },
  body: { en: string; vi: string },
) {
  return {
    type: 'prose',
    key,
    schemaVersion: 1,
    layout: 'ONE',
    surface: 'PLAIN',
    sortOrder: 0,
    isVisible: true,
    props: { heading: { title }, body },
  } satisfies SeedBlock;
}

const ABOUT_ORDER = [
  'intro',
  AI_AGENTS_BLOCK_KEY,
  'stats',
  'experience',
  'side-projects',
  'principles',
  'skills',
  'education',
  'cv',
];

/** Adds the owner-only "Building with AI agents" and "Side projects" sections to About. */
export function withOwnerAboutBlocks(pages: SeedPage[]): SeedPage[] {
  const about = pages.find((page) => page.key === 'ABOUT');
  if (!about) {
    throw new Error('Owner copy: ABOUT page is missing');
  }
  about.blocks.push(
    proseBlock(
      AI_AGENTS_BLOCK_KEY,
      { en: 'Building with AI agents', vi: 'Làm việc cùng AI agent' },
      { en: AI_AGENTS_EN, vi: AI_AGENTS_VI },
    ),
    proseBlock(
      'side-projects',
      { en: 'Side projects', vi: 'Dự án cá nhân' },
      { en: SIDE_PROJECTS_EN, vi: SIDE_PROJECTS_VI },
    ),
  );
  const rank = (key: string) => {
    const index = ABOUT_ORDER.indexOf(key);
    return index < 0 ? ABOUT_ORDER.length : index;
  };
  about.blocks.sort((a, b) => rank(a.key) - rank(b.key));
  about.blocks.forEach((block, index) => {
    block.sortOrder = index;
  });
  return pages;
}
