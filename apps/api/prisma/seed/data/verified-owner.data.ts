import { readFileSync } from 'node:fs';

import { applyOwnerCopy } from './owner-copy.data';
import { loadPortfolioData, type PortfolioJson } from './portfolio.mapper';

export const VERIFIED_PROJECT_SLUGS = [
  'particula',
  'cfw-back-office-field-config',
  'cfw-sales-crm',
  'msp-advanced',
  'msp-app-expansion',
  'migration-data-tool',
  'lil-j-birthday-site',
  'ctrack-crystal',
  'interview-senior-fe',
  'my-3d-room',
] as const;

const SOURCE_PROJECTS = [
  'Particula',
  'CFW Back Office',
  'CFW Sales CRM',
  'MSP Advanced',
  'MSP App Expansion',
  'Migration Data Tool',
  'Even the Stars Know Your Name',
  'Ctrack Crystal',
  'Interview Senior FE',
] as const;

const HERO_STATS = [
  { value: '5+', labelEn: 'Years', labelVi: 'Năm kinh nghiệm' },
  { value: '3', labelEn: 'Companies', labelVi: 'Công ty' },
  { value: '10+', labelEn: 'Projects', labelVi: 'Dự án' },
] as const;

const VI_SUMMARIES: Record<string, string> = {
  particula: 'Nền tảng đánh giá và phân tích tài sản thực được mã hóa.',
  'cfw-back-office-field-config': 'Quy tắc xác minh theo từng trường dữ liệu khách hàng.',
  'cfw-sales-crm': 'Duyệt tuyến viếng thăm trên iPad và giao diện gợi ý sản phẩm.',
  'msp-advanced': 'Chuyển logic sang sản phẩm mới với thiết kế mới.',
  'msp-app-expansion': 'Giao diện xử lý yêu cầu phát sinh từ Jira.',
  'migration-data-tool': 'Chuyển dữ liệu cửa hàng giữa các nền tảng thương mại điện tử.',
  'lil-j-birthday-site': 'Trang chuyện sinh nhật song ngữ với đếm ngược và trò chơi.',
  'ctrack-crystal': 'Nền tảng quản lý đội xe dạng dịch vụ.',
  'interview-senior-fe': 'Ứng dụng ôn luyện phỏng vấn frontend song ngữ.',
};

const PUBLIC_REPO_PROJECT: Record<string, unknown> = {
  slug: 'my-3d-room',
  titleEn: 'My Room in 3D',
  titleVi: 'Căn phòng 3D của tôi',
  taglineEn: 'An interactive browser room built with Three.js and JavaScript.',
  taglineVi: 'Căn phòng tương tác trên trình duyệt, xây bằng Three.js và JavaScript.',
  client: 'Personal project',
  roleEn: 'Author and developer',
  roleVi: 'Tác giả và lập trình viên',
  startDate: '2022-12',
  endDate: null,
  isFeatured: false,
  isConfidential: false,
  liveUrl: null,
  repoUrl: 'https://github.com/parker2808/my-3d-room',
  domain: '',
  experience: '',
  problemEn: '',
  problemVi: '',
  constraintsEn: '',
  constraintsVi: '',
  approachEn: 'Built the room with Three.js and JavaScript.',
  approachVi: 'Xây căn phòng bằng Three.js và JavaScript.',
  decisionsEn: '',
  decisionsVi: '',
  outcomeEn: 'A browser-based 3D room project.',
  outcomeVi: 'Một dự án căn phòng 3D chạy trên trình duyệt.',
  lessonsEn: '',
  lessonsVi: '',
  keyFactsEn: '',
  keyFactsVi: '',
  factChipsEn: 'Three.js, JavaScript',
  factChipsVi: 'Three.js, JavaScript',
  notMineEn: null,
  notMineVi: null,
  metrics: [],
  skills: [],
  status: 'PUBLISHED',
  sortOrder: 9,
};

function readPrivateSource(): string {
  const sourcePath = process.env.LILP_PRIVATE_SOURCE_PATH;
  if (!sourcePath) {
    throw new Error('Private content source is required');
  }
  try {
    return readFileSync(sourcePath, 'utf8');
  } catch {
    // Do not expose the private path in an error or seed log.
    throw new Error('Private content source cannot be read');
  }
}

/** Validate the evidence used for the nine owner projects without storing the source. */
export function validatePrivateSource(source: string): string[] {
  const projectSection = /^## Projects[^\n]*\n([\s\S]*?)(?=^## |$(?![\s\S]))/m.exec(source)?.[1];
  const entries = projectSection?.match(/^- \*\*[^*]+\*\*[^\n]*/gm) ?? [];
  if (entries.length !== SOURCE_PROJECTS.length) {
    throw new Error('Private content source must contain nine project records');
  }
  const requiredFacts = [
    ...SOURCE_PROJECTS,
    'CMC Global',
    'Kobizo',
    'LitGroup',
    'University of Industry',
    'Computer Science',
  ];
  if (
    requiredFacts.some((fact) => !source.toLowerCase().includes(fact.toLowerCase())) ||
    SOURCE_PROJECTS.some(
      (name, index) => !entries[index]?.includes(`**${name}**`) && !entries[index]?.includes(name),
    )
  ) {
    throw new Error('Private content source is missing required evidence');
  }
  if (entries.some((entry) => !/\d{4}-\d{2}/.test(entry) || !entry.includes(': '))) {
    throw new Error('Private content source has incomplete project dates or summaries');
  }
  return entries;
}

function withoutPlaceholderLines(value: string): string {
  return value
    .split('\n')
    .filter((line) => !/\b(?:TODO|TBD|placeholder)\b/i.test(line))
    .join('\n')
    .trim();
}

function cleanTextFields(row: Record<string, unknown>): void {
  for (const [key, value] of Object.entries(row)) {
    if (typeof value === 'string' && !key.startsWith('_')) {
      row[key] = withoutPlaceholderLines(value);
    }
  }
}

export function buildVerifiedOwnerData(source: string): PortfolioJson {
  const entries = validatePrivateSource(source);
  const data = applyOwnerCopy(loadPortfolioData());
  data.projects = data.projects.filter((project) => project.slug !== 'lil-p');
  data.projects.push(structuredClone(PUBLIC_REPO_PROJECT));
  if (
    data.projects.length !== VERIFIED_PROJECT_SLUGS.length ||
    VERIFIED_PROJECT_SLUGS.some((slug) => !data.projects.some((project) => project.slug === slug))
  ) {
    throw new Error('Verified project set must contain exactly ten distinct projects');
  }

  for (const [index, project] of data.projects.entries()) {
    cleanTextFields(project);
    if (project.slug === 'my-3d-room') continue;
    const entry = entries[index];
    const dates = /(\d{4}-\d{2})(?: to (\d{4}-\d{2}|now|present))?/i.exec(entry);
    if (!dates) throw new Error('Private content source has invalid project dates');
    const summary = entry.slice(entry.lastIndexOf('): ') + 3).trim();
    if (!summary || /[<>@]/.test(summary)) throw new Error('Private project summary is unsafe');
    project.startDate = dates[1];
    project.endDate = !dates[2] || /^(?:now|present)$/i.test(dates[2]) ? null : dates[2];
    project.taglineEn = summary;
    project.taglineVi = VI_SUMMARIES[String(project.slug)];
    project.problemEn = summary;
    project.problemVi = project.taglineVi;
    for (const field of [
      'constraintsEn',
      'constraintsVi',
      'approachEn',
      'approachVi',
      'decisionsEn',
      'decisionsVi',
      'outcomeEn',
      'outcomeVi',
      'lessonsEn',
      'lessonsVi',
      'keyFactsEn',
      'keyFactsVi',
      'factChipsEn',
      'factChipsVi',
      'notMineEn',
      'notMineVi',
    ])
      project[field] = '';
    project.metrics = [];
    project.teamSize = null;
    project.versionFrom = null;
    project.versionTo = null;
    project.releaseStatus = null;
    if (project.slug === 'ctrack-crystal') project.experience = '';
    if (project.slug === 'cfw-back-office-field-config') {
      project.roleEn = 'Frontend Developer';
      project.roleVi = 'Lập trình viên frontend';
    }
    if (project.slug === 'lil-j-birthday-site' || project.slug === 'interview-senior-fe') {
      project.roleEn = 'Developer';
      project.roleVi = 'Lập trình viên';
    }
  }
  for (const row of data.experience) {
    cleanTextFields(row);
    row.highlightsEn = '';
    row.highlightsVi = '';
  }
  for (const row of data.education) cleanTextFields(row);
  cleanTextFields(data.profile);
  cleanTextFields(data.siteSettings);

  // The source verifies the school, subject and dates, but not a degree title.
  const education = data.education.find((row) => row.school === 'Hanoi University of Industry');
  if (education) {
    education.degreeEn = 'Computer Science studies';
    education.degreeVi = 'Học ngành Khoa học máy tính';
  }
  data.siteSettings.contactEmail = '';
  data.profile.phone = '';
  data.profile.languagesEn = 'Vietnamese and English';
  data.profile.languagesVi = 'Tiếng Việt và tiếng Anh';
  data.profile.bioEn =
    'Frontend developer with experience at CMC Global, Kobizo and LitGroup, working across client products and independent projects.';
  data.profile.bioVi =
    'Lập trình viên frontend có kinh nghiệm tại CMC Global, Kobizo và LitGroup, làm sản phẩm cho khách hàng và dự án cá nhân.';
  const recent = data.experience.find((row) => row.key === 'cmc-cfw');
  if (recent) {
    recent.startDate = '2026-07';
    recent.roleEn = 'Frontend Developer';
    recent.roleVi = 'Frontend Developer';
    recent.summaryEn =
      'Frontend work on back-office and field sales products for a Thai retail group.';
    recent.summaryVi =
      'Làm frontend cho sản phẩm quản trị và bán hàng thực địa của một tập đoàn bán lẻ Thái Lan.';
    if (Array.isArray(recent.skills)) {
      recent.skills = recent.skills.filter((slug) => slug !== 'nestjs');
    }
  }
  data.siteSettings.heroStats = HERO_STATS;
  // The old manual framework-migration count explicitly lacked a second source.
  data.profileStats = data.profileStats.filter((row) => row.labelEn !== 'Framework migrations');
  return data;
}

export function loadVerifiedOwnerData(): PortfolioJson {
  return buildVerifiedOwnerData(readPrivateSource());
}
