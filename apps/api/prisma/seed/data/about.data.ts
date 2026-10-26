import type { PrismaClient } from '../../../src/generated/prisma/client';

/**
 * Placeholder About rows (PLAN T15). Company names and copy come from the
 * wireframe grouping, not live CV contact data.
 */

export const experienceData = [
  {
    company: 'Acme Platform',
    companyUrl: 'https://example.com/acme',
    location: 'Remote',
    employmentType: 'FULL_TIME' as const,
    roleEn: 'Backend Engineer',
    roleVi: 'Kỹ sư backend',
    summaryEn: 'APIs and data jobs that kept weekly delivery moving.',
    summaryVi: 'API và job dữ liệu để giữ nhịp giao hàng hàng tuần.',
    highlightsEn: '- Owned the read path\n- Cut job time in half',
    highlightsVi: '- Phụ trách luồng đọc\n- Giảm thời gian job còn một nửa',
    startDate: new Date('2021-01-01'),
    endDate: new Date('2022-06-30'),
    sortOrder: 1,
    isVisible: true,
  },
  {
    company: 'Acme Platform',
    companyUrl: 'https://example.com/acme',
    location: 'Remote',
    employmentType: 'FULL_TIME' as const,
    roleEn: 'Frontend Engineer',
    roleVi: 'Kỹ sư frontend',
    summaryEn: 'Moved the product UI forward without a rewrite.',
    summaryVi: 'Đưa UI sản phẩm tiến lên mà không viết lại.',
    highlightsEn: '- Vue 2 to Vue 3 in slices\n- Shared design tokens',
    highlightsVi: '- Vue 2 sang Vue 3 theo lát\n- Token thiết kế dùng chung',
    startDate: new Date('2022-07-01'),
    endDate: null,
    sortOrder: 0,
    isVisible: true,
  },
  {
    company: 'Contoso Commerce',
    companyUrl: 'https://example.com/contoso',
    location: 'Remote',
    employmentType: 'CONTRACT' as const,
    roleEn: 'Frontend Engineer',
    roleVi: 'Kỹ sư frontend',
    summaryEn: 'Cart flows that talked to more than one store platform.',
    summaryVi: 'Luồng giỏ hàng nói chuyện với hơn một nền tảng cửa hàng.',
    highlightsEn: '- One checkout over four adapters\n- Contract tests on the edge',
    highlightsVi: '- Một checkout trên bốn adapter\n- Test hợp đồng ở biên',
    startDate: new Date('2023-03-01'),
    endDate: new Date('2024-02-29'),
    sortOrder: 0,
    isVisible: true,
  },
  {
    company: 'Example Enterprise',
    companyUrl: null,
    location: 'Hybrid',
    employmentType: 'FULL_TIME' as const,
    roleEn: 'Frontend Engineer',
    roleVi: 'Kỹ sư frontend',
    summaryEn: 'Ops tools for a large internal team.',
    summaryVi: 'Công cụ vận hành cho một team nội bộ lớn.',
    highlightsEn: '- Data-dense tables\n- Role-aware screens',
    highlightsVi: '- Bảng nhiều dữ liệu\n- Màn hình theo vai trò',
    startDate: new Date('2024-03-01'),
    endDate: null,
    sortOrder: 0,
    isVisible: true,
  },
  {
    company: 'Hidden Co',
    companyUrl: null,
    location: 'Remote',
    employmentType: 'FREELANCE' as const,
    roleEn: 'Hidden role',
    roleVi: 'Vai trò ẩn',
    summaryEn: 'Must not appear on public lists.',
    summaryVi: 'Không được hiện trên danh sách công khai.',
    highlightsEn: '- hidden',
    highlightsVi: '- ẩn',
    startDate: new Date('2019-01-01'),
    endDate: new Date('2019-06-01'),
    sortOrder: 99,
    isVisible: false,
  },
];

export const educationData = [
  {
    school: 'Technical University',
    degreeEn: 'Bachelor',
    degreeVi: 'Cử nhân',
    majorEn: 'Computer Science',
    majorVi: 'Khoa học máy tính',
    startDate: new Date('2017-09-01'),
    endDate: new Date('2021-06-30'),
    sortOrder: 0,
    isVisible: true,
  },
];

export const principleData = [
  {
    titleEn: 'Migrate in slices',
    titleVi: 'Migrate theo lát',
    bodyEn: 'Keep weekly delivery while the stack changes under the users.',
    bodyVi: 'Giữ nhịp giao hàng hàng tuần trong khi stack thay đổi dưới chân người dùng.',
    iconKey: 'scissors',
    sortOrder: 0,
    isVisible: true,
  },
  {
    titleEn: 'Contracts before UI',
    titleVi: 'Hợp đồng trước UI',
    bodyEn: 'Agree the shape of the data, then paint the screen.',
    bodyVi: 'Thống nhất hình dạng dữ liệu, rồi mới vẽ màn hình.',
    iconKey: 'file-check',
    sortOrder: 1,
    isVisible: true,
  },
  {
    titleEn: 'Ship the boring path first',
    titleVi: 'Ship đường đi nhàm chán trước',
    bodyEn: 'The happy path and the empty state land before the flourish.',
    bodyVi: 'Đường đi hạnh phúc và trạng thái trống đến trước phần trang trí.',
    iconKey: 'route',
    sortOrder: 2,
    isVisible: true,
  },
];

export const profileStatData = [
  {
    labelEn: 'Years',
    labelVi: 'Năm',
    value: null,
    suffix: '+',
    source: 'YEARS_COMPUTED' as const,
    iconKey: 'clock',
    sortOrder: 0,
    isVisible: true,
  },
  {
    labelEn: 'Shipped products',
    labelVi: 'Sản phẩm đã ship',
    value: null,
    suffix: null,
    source: 'PROJECT_COUNT' as const,
    iconKey: 'rocket',
    sortOrder: 1,
    isVisible: true,
  },
  {
    labelEn: 'Framework migrations',
    labelVi: 'Cuộc migration framework',
    value: '2',
    suffix: null,
    source: 'MANUAL' as const,
    iconKey: 'git-branch',
    sortOrder: 2,
    isVisible: true,
  },
  {
    labelEn: 'Enterprise platforms',
    labelVi: 'Nền tảng doanh nghiệp',
    value: '1',
    suffix: null,
    source: 'MANUAL' as const,
    iconKey: 'building-2',
    sortOrder: 3,
    isVisible: true,
  },
];

export const processStepData = [
  {
    titleEn: 'Audit',
    titleVi: 'Rà soát',
    captionEn: 'What exists, what hurts, what must keep working.',
    captionVi: 'Cái gì đang có, cái gì đau, cái gì phải tiếp tục chạy.',
    iconKey: 'search',
    sortOrder: 0,
    isVisible: true,
  },
  {
    titleEn: 'Tokens and primitives',
    titleVi: 'Token và primitive',
    captionEn: 'One language for color, type, and controls.',
    captionVi: 'Một ngôn ngữ cho màu, chữ và control.',
    iconKey: 'paintbrush',
    sortOrder: 1,
    isVisible: true,
  },
  {
    titleEn: 'Strangler routes',
    titleVi: 'Route strangler',
    captionEn: 'New shell, old pages, one route at a time.',
    captionVi: 'Vỏ mới, trang cũ, từng route một.',
    iconKey: 'route',
    sortOrder: 2,
    isVisible: true,
  },
  {
    titleEn: 'Contract tests',
    titleVi: 'Test hợp đồng',
    captionEn: 'The API shape is the fence the UI cannot cross.',
    captionVi: 'Hình dạng API là hàng rào UI không được vượt.',
    iconKey: 'file-check',
    sortOrder: 3,
    isVisible: true,
  },
  {
    titleEn: 'Cut over',
    titleVi: 'Cắt sang',
    captionEn: 'Turn the old path off only after the new one is boring.',
    captionVi: 'Tắt đường cũ chỉ khi đường mới đã nhàm chán.',
    iconKey: 'scissors',
    sortOrder: 4,
    isVisible: true,
  },
];

export async function seedAbout(prisma: PrismaClient): Promise<void> {
  await prisma.experience.deleteMany();
  await prisma.education.deleteMany();
  await prisma.principle.deleteMany();
  await prisma.profileStat.deleteMany();
  await prisma.processStep.deleteMany();

  await prisma.experience.createMany({ data: experienceData });
  await prisma.education.createMany({ data: educationData });
  await prisma.principle.createMany({ data: principleData });
  await prisma.profileStat.createMany({ data: profileStatData });
  await prisma.processStep.createMany({ data: processStepData });
}
