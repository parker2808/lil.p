import type { ContentStatus, PrismaClient } from '../../../src/generated/prisma/client';

const domains = [
  {
    slug: 'fintech',
    nameEn: 'Fintech / Web3',
    nameVi: 'Fintech / Web3',
    descriptionEn: 'Ratings and ledgers where the numbers have to stay honest.',
    descriptionVi: 'Xếp hạng và sổ cái, nơi con số phải trung thực.',
    hue: 'AMBER' as const,
    iconKey: 'wallet',
    sortOrder: 0,
    isVisible: true,
  },
  {
    slug: 'enterprise',
    nameEn: 'Enterprise platforms',
    nameVi: 'Nền tảng doanh nghiệp',
    descriptionEn: 'Internal tools that a large team actually uses every week.',
    descriptionVi: 'Công cụ nội bộ mà một team lớn thật sự dùng mỗi tuần.',
    hue: 'BLUE' as const,
    iconKey: 'building-2',
    sortOrder: 1,
    isVisible: true,
  },
  {
    slug: 'commerce',
    nameEn: 'E-commerce tooling',
    nameVi: 'Công cụ thương mại',
    descriptionEn: 'Cart and checkout flows over more than one store platform.',
    descriptionVi: 'Luồng giỏ hàng và thanh toán trên hơn một nền tảng cửa hàng.',
    hue: 'VIOLET' as const,
    iconKey: 'shopping-bag',
    sortOrder: 2,
    isVisible: true,
  },
  {
    slug: 'dx',
    nameEn: 'Developer experience',
    nameVi: 'Trải nghiệm lập trình viên',
    descriptionEn: 'The tests and primitives that let a migration stay boring.',
    descriptionVi: 'Test và primitive để một cuộc migration giữ được sự nhàm chán.',
    hue: 'JADE' as const,
    iconKey: 'flask-conical',
    sortOrder: 3,
    isVisible: true,
  },
];

type ProjectSeed = {
  slug: string;
  domainSlug: string;
  experienceRoleEn: string;
  experienceCompany: string;
  isFeatured: boolean;
  isConfidential: boolean;
  titleEn: string;
  titleVi: string;
  taglineEn: string;
  taglineVi: string;
  client: string;
  roleEn: string;
  roleVi: string;
  teamSize: number;
  startDate: Date;
  endDate: Date | null;
  versionFrom: string | null;
  versionTo: string | null;
  liveUrl: string | null;
  repoUrl: string | null;
  keyFactsEn: string;
  keyFactsVi: string;
  factChipsEn: string;
  factChipsVi: string;
  metrics: { labelEn: string; labelVi: string; before: string; after: string; value: string }[];
};

const projects: ProjectSeed[] = [
  {
    slug: 'particula',
    domainSlug: 'fintech',
    experienceCompany: 'Acme Platform',
    experienceRoleEn: 'Frontend Engineer',
    isFeatured: true,
    isConfidential: false,
    titleEn: 'Particula v2',
    titleVi: 'Particula v2',
    taglineEn: 'Vue 2 to Nuxt 3 without a release freeze.',
    taglineVi: 'Vue 2 sang Nuxt 3 mà không đóng băng release.',
    client: 'Acme Platform',
    roleEn: 'Frontend Engineer',
    roleVi: 'Kỹ sư frontend',
    teamSize: 5,
    startDate: new Date('2024-01-01'),
    endDate: null,
    versionFrom: 'v1',
    versionTo: 'v2',
    liveUrl: 'https://example.com/particula',
    repoUrl: null,
    keyFactsEn: 'Zero downtime\nStrangler routes\nShared tokens',
    keyFactsVi: 'Không downtime\nRoute strangler\nToken dùng chung',
    factChipsEn: 'Vue 2 → Nuxt 3, 0 downtime, 6 months',
    factChipsVi: 'Vue 2 → Nuxt 3, 0 downtime, 6 tháng',
    metrics: [
      {
        labelEn: 'Release freeze',
        labelVi: 'Đóng băng release',
        before: 'yes',
        after: 'no',
        value: '0',
      },
    ],
  },
  {
    slug: 'ops-console',
    domainSlug: 'enterprise',
    experienceCompany: 'Example Enterprise',
    experienceRoleEn: 'Frontend Engineer',
    isFeatured: false,
    isConfidential: true,
    titleEn: 'Ops console',
    titleVi: 'Bảng điều khiển vận hành',
    taglineEn: 'Data-dense tables for a large internal team.',
    taglineVi: 'Bảng nhiều dữ liệu cho một team nội bộ lớn.',
    client: 'Example Enterprise',
    roleEn: 'Frontend Engineer',
    roleVi: 'Kỹ sư frontend',
    teamSize: 8,
    startDate: new Date('2024-03-01'),
    endDate: null,
    versionFrom: null,
    versionTo: null,
    liveUrl: 'https://example.com/ops',
    repoUrl: 'https://example.com/ops.git',
    keyFactsEn: 'Role-aware screens\nKeyboard tables',
    keyFactsVi: 'Màn hình theo vai trò\nBảng dùng bàn phím',
    factChipsEn: 'TypeScript, NDA',
    factChipsVi: 'TypeScript, NDA',
    metrics: [
      {
        labelEn: 'Time to find a row',
        labelVi: 'Thời gian tìm một dòng',
        before: '40s',
        after: '8s',
        value: '8s',
      },
    ],
  },
  {
    slug: 'cart-adapters',
    domainSlug: 'commerce',
    experienceCompany: 'Contoso Commerce',
    experienceRoleEn: 'Frontend Engineer',
    isFeatured: false,
    isConfidential: false,
    titleEn: 'Cart adapters',
    titleVi: 'Adapter giỏ hàng',
    taglineEn: 'One checkout over four store platforms.',
    taglineVi: 'Một checkout trên bốn nền tảng cửa hàng.',
    client: 'Contoso Commerce',
    roleEn: 'Frontend Engineer',
    roleVi: 'Kỹ sư frontend',
    teamSize: 4,
    startDate: new Date('2023-03-01'),
    endDate: new Date('2024-02-29'),
    versionFrom: null,
    versionTo: null,
    liveUrl: 'https://example.com/cart',
    repoUrl: null,
    keyFactsEn: 'Four adapters\nContract tests on the edge',
    keyFactsVi: 'Bốn adapter\nTest hợp đồng ở biên',
    factChipsEn: 'Adapters, contract tests',
    factChipsVi: 'Adapter, test hợp đồng',
    metrics: [
      {
        labelEn: 'Store platforms',
        labelVi: 'Nền tảng cửa hàng',
        before: '1',
        after: '4',
        value: '4',
      },
    ],
  },
  {
    slug: 'token-kit',
    domainSlug: 'dx',
    experienceCompany: 'Acme Platform',
    experienceRoleEn: 'Backend Engineer',
    isFeatured: false,
    isConfidential: false,
    titleEn: 'Token kit',
    titleVi: 'Bộ token',
    taglineEn: 'One language for color, type, and controls.',
    taglineVi: 'Một ngôn ngữ cho màu, chữ và control.',
    client: 'Acme Platform',
    roleEn: 'Backend Engineer',
    roleVi: 'Kỹ sư backend',
    teamSize: 3,
    startDate: new Date('2021-06-01'),
    endDate: new Date('2022-06-30'),
    versionFrom: null,
    versionTo: null,
    liveUrl: null,
    repoUrl: 'https://example.com/tokens',
    keyFactsEn: 'Shared primitives\nStorybook first',
    keyFactsVi: 'Primitive dùng chung\nStorybook trước',
    factChipsEn: 'Tokens, Storybook',
    factChipsVi: 'Token, Storybook',
    metrics: [
      {
        labelEn: 'Primitive coverage',
        labelVi: 'Phủ primitive',
        before: '12%',
        after: '80%',
        value: '80%',
      },
    ],
  },
];

const CASE_TEXT = {
  problemEn: 'The old path still had to ship every week.',
  problemVi: 'Đường cũ vẫn phải ship mỗi tuần.',
  constraintsEn: 'No freeze. Same users.',
  constraintsVi: 'Không đóng băng. Cùng người dùng.',
  approachEn: 'Slice the work and keep a contract at the edge.',
  approachVi: 'Cắt việc thành lát và giữ một hợp đồng ở biên.',
  decisionsEn: 'Tokens first, then routes, then cut over.',
  decisionsVi: 'Token trước, rồi route, rồi cắt sang.',
  outcomeEn: 'Weekly delivery never stopped.',
  outcomeVi: 'Nhịp giao hàng hàng tuần không dừng.',
  lessonsEn: 'The boring path is the one you can turn off last.',
  lessonsVi: 'Đường đi nhàm chán là đường bạn tắt sau cùng.',
};

export async function seedWork(prisma: PrismaClient, status: ContentStatus): Promise<void> {
  await prisma.project.deleteMany();
  await prisma.domain.deleteMany();

  const domainRows = await Promise.all(
    domains.map((domain) => prisma.domain.create({ data: domain })),
  );
  const domainBySlug = new Map(domainRows.map((row) => [row.slug, row.id]));

  const publishedAt = status === 'PUBLISHED' ? new Date('2026-01-15') : null;

  for (const [index, project] of projects.entries()) {
    const experience = await prisma.experience.findFirst({
      where: { company: project.experienceCompany, roleEn: project.experienceRoleEn },
    });
    const domainId = domainBySlug.get(project.domainSlug);
    if (!domainId) {
      throw new Error(`Missing domain ${project.domainSlug}`);
    }

    await prisma.project.create({
      data: {
        slug: project.slug,
        titleEn: project.titleEn,
        titleVi: project.titleVi,
        taglineEn: project.taglineEn,
        taglineVi: project.taglineVi,
        client: project.client,
        roleEn: project.roleEn,
        roleVi: project.roleVi,
        teamSize: project.teamSize,
        startDate: project.startDate,
        endDate: project.endDate,
        versionFrom: project.versionFrom,
        versionTo: project.versionTo,
        isFeatured: project.isFeatured,
        isConfidential: project.isConfidential,
        liveUrl: project.liveUrl,
        repoUrl: project.repoUrl,
        ...CASE_TEXT,
        keyFactsEn: project.keyFactsEn,
        keyFactsVi: project.keyFactsVi,
        factChipsEn: project.factChipsEn,
        factChipsVi: project.factChipsVi,
        status,
        publishedAt,
        sortOrder: index,
        domainId,
        experienceId: experience?.id,
        metrics: {
          create: project.metrics.map((metric, metricIndex) => ({
            ...metric,
            sortOrder: metricIndex,
          })),
        },
      },
    });
  }
}
