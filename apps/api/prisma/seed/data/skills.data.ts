import type { PrismaClient, SkillDepth } from '../../../src/generated/prisma/client';

const categories = [
  { key: 'frontend', nameEn: 'Frontend', nameVi: 'Frontend', sortOrder: 0 },
  { key: 'testing', nameEn: 'Testing', nameVi: 'Kiểm thử', sortOrder: 1 },
  { key: 'backend', nameEn: 'Backend', nameVi: 'Backend', sortOrder: 2 },
  { key: 'data', nameEn: 'Data', nameVi: 'Dữ liệu', sortOrder: 3 },
  { key: 'workflow', nameEn: 'Workflow', nameVi: 'Quy trình', sortOrder: 4 },
];

const skills: {
  name: string;
  slug: string;
  category: string;
  depth: SkillDepth;
  showInMarquee: boolean;
  sortOrder: number;
}[] = [
  {
    name: 'Vue 3',
    slug: 'vue-3',
    category: 'frontend',
    depth: 'DAILY',
    showInMarquee: true,
    sortOrder: 0,
  },
  {
    name: 'Nuxt 3',
    slug: 'nuxt',
    category: 'frontend',
    depth: 'DAILY',
    showInMarquee: true,
    sortOrder: 1,
  },
  {
    name: 'TypeScript',
    slug: 'typescript',
    category: 'frontend',
    depth: 'DAILY',
    showInMarquee: true,
    sortOrder: 2,
  },
  {
    name: 'Pinia',
    slug: 'pinia',
    category: 'frontend',
    depth: 'DAILY',
    showInMarquee: true,
    sortOrder: 3,
  },
  {
    name: 'Tailwind',
    slug: 'tailwind',
    category: 'frontend',
    depth: 'DAILY',
    showInMarquee: true,
    sortOrder: 4,
  },
  {
    name: 'PrimeVue',
    slug: 'primevue',
    category: 'frontend',
    depth: 'DAILY',
    showInMarquee: true,
    sortOrder: 5,
  },
  {
    name: 'Vue 2',
    slug: 'vue-2',
    category: 'frontend',
    depth: 'SHIPPED',
    showInMarquee: false,
    sortOrder: 6,
  },
  {
    name: 'Vuex',
    slug: 'vuex',
    category: 'frontend',
    depth: 'SHIPPED',
    showInMarquee: false,
    sortOrder: 7,
  },
  {
    name: 'React',
    slug: 'react',
    category: 'frontend',
    depth: 'GROWING',
    showInMarquee: false,
    sortOrder: 8,
  },
  {
    name: 'Next.js',
    slug: 'nextjs',
    category: 'frontend',
    depth: 'GROWING',
    showInMarquee: true,
    sortOrder: 9,
  },
  {
    name: 'Playwright',
    slug: 'playwright',
    category: 'testing',
    depth: 'DAILY',
    showInMarquee: true,
    sortOrder: 0,
  },
  {
    name: 'Vitest',
    slug: 'vitest',
    category: 'testing',
    depth: 'SHIPPED',
    showInMarquee: false,
    sortOrder: 1,
  },
  {
    name: 'NestJS',
    slug: 'nestjs',
    category: 'backend',
    depth: 'GROWING',
    showInMarquee: true,
    sortOrder: 0,
  },
  {
    name: 'Flask',
    slug: 'flask',
    category: 'backend',
    depth: 'SHIPPED',
    showInMarquee: false,
    sortOrder: 1,
  },
  {
    name: 'Laravel',
    slug: 'laravel',
    category: 'backend',
    depth: 'SHIPPED',
    showInMarquee: false,
    sortOrder: 2,
  },
  {
    name: 'REST',
    slug: 'rest',
    category: 'backend',
    depth: 'SHIPPED',
    showInMarquee: false,
    sortOrder: 3,
  },
  {
    name: 'GraphQL',
    slug: 'graphql',
    category: 'backend',
    depth: 'SHIPPED',
    showInMarquee: false,
    sortOrder: 4,
  },
  {
    name: 'OAuth',
    slug: 'oauth',
    category: 'backend',
    depth: 'SHIPPED',
    showInMarquee: false,
    sortOrder: 5,
  },
  {
    name: 'TanStack Query',
    slug: 'tanstack-query',
    category: 'data',
    depth: 'DAILY',
    showInMarquee: true,
    sortOrder: 0,
  },
  {
    name: 'MySQL',
    slug: 'mysql',
    category: 'data',
    depth: 'SHIPPED',
    showInMarquee: false,
    sortOrder: 1,
  },
  {
    name: 'Prisma',
    slug: 'prisma',
    category: 'data',
    depth: 'GROWING',
    showInMarquee: false,
    sortOrder: 2,
  },
  {
    name: 'Git',
    slug: 'git',
    category: 'workflow',
    depth: 'DAILY',
    showInMarquee: false,
    sortOrder: 0,
  },
  {
    name: 'CI',
    slug: 'ci',
    category: 'workflow',
    depth: 'DAILY',
    showInMarquee: false,
    sortOrder: 1,
  },
  {
    name: 'Docker',
    slug: 'docker',
    category: 'workflow',
    depth: 'SHIPPED',
    showInMarquee: false,
    sortOrder: 2,
  },
  {
    name: 'Storybook',
    slug: 'storybook',
    category: 'workflow',
    depth: 'SHIPPED',
    showInMarquee: false,
    sortOrder: 3,
  },
];

const projectSkills: Record<string, string[]> = {
  particula: ['nuxt', 'vue-3', 'typescript', 'tanstack-query', 'playwright'],
  'ops-console': ['typescript', 'vue-2', 'vuex'],
  'cart-adapters': ['vue-2', 'flask', 'laravel', 'rest'],
  'token-kit': ['mysql', 'storybook', 'typescript'],
};

const experienceSkills: { company: string; roleEn: string; slugs: string[] }[] = [
  {
    company: 'Acme Platform',
    roleEn: 'Frontend Engineer',
    slugs: ['nuxt', 'vue-3', 'tanstack-query'],
  },
  { company: 'Acme Platform', roleEn: 'Backend Engineer', slugs: ['mysql', 'rest'] },
  { company: 'Contoso Commerce', roleEn: 'Frontend Engineer', slugs: ['vue-2', 'flask'] },
  { company: 'Example Enterprise', roleEn: 'Frontend Engineer', slugs: ['typescript', 'vue-2'] },
];

export async function seedSkills(prisma: PrismaClient): Promise<void> {
  await prisma.skill.deleteMany();
  await prisma.skillCategory.deleteMany();

  const categoryRows = await Promise.all(
    categories.map((category) =>
      prisma.skillCategory.create({
        data: {
          nameEn: category.nameEn,
          nameVi: category.nameVi,
          sortOrder: category.sortOrder,
        },
      }),
    ),
  );
  const categoryId = new Map(
    categories.map((category, index) => [category.key, categoryRows[index]!.id]),
  );

  const skillRows = await Promise.all(
    skills.map((skill) =>
      prisma.skill.create({
        data: {
          name: skill.name,
          slug: skill.slug,
          depth: skill.depth,
          showInMarquee: skill.showInMarquee,
          sortOrder: skill.sortOrder,
          categoryId: categoryId.get(skill.category)!,
        },
      }),
    ),
  );
  const skillId = new Map(skillRows.map((row) => [row.slug, row.id]));

  for (const [slug, slugs] of Object.entries(projectSkills)) {
    await prisma.project.update({
      where: { slug },
      data: { skills: { set: slugs.map((item) => ({ id: skillId.get(item)! })) } },
    });
  }

  for (const link of experienceSkills) {
    const experience = await prisma.experience.findFirst({
      where: { company: link.company, roleEn: link.roleEn },
    });
    if (!experience) {
      continue;
    }
    await prisma.experience.update({
      where: { id: experience.id },
      data: { skills: { set: link.slugs.map((item) => ({ id: skillId.get(item)! })) } },
    });
  }
}
