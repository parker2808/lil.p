import type { PrismaClient } from '../../../src/generated/prisma/client';
import { pagesData, seedPages } from '../data/pages.data';
import {
  loadPortfolioData,
  mapContactTopics,
  mapDomains,
  mapEducation,
  mapExperience,
  mapNavItems,
  mapPrinciples,
  mapProcessSteps,
  mapProfile,
  mapProfileStats,
  mapProjects,
  mapSiteSettings,
  mapSkillCategories,
  mapSkills,
  mapSocialLinks,
  overlayPageSectionTitles,
} from '../data/portfolio.mapper';

/**
 * Production first boot (PLAN D13 + owner CV). Values come from
 * `data/portfolio-data.json`. Projects stay DRAFT. 0 posts.
 */
export async function seedOwner(prisma: PrismaClient): Promise<void> {
  const data = loadPortfolioData();

  await prisma.project.deleteMany();
  await prisma.domain.deleteMany();
  await prisma.experience.deleteMany();
  await prisma.education.deleteMany();
  await prisma.principle.deleteMany();
  await prisma.profileStat.deleteMany();
  await prisma.processStep.deleteMany();
  await prisma.skill.deleteMany();
  await prisma.skillCategory.deleteMany();
  await prisma.post.deleteMany();
  await prisma.tag.deleteMany();
  await prisma.navItem.deleteMany();
  await prisma.socialLink.deleteMany();
  await prisma.contactTopic.deleteMany();

  await prisma.siteSettings.upsert({
    where: { id: 1 },
    create: { id: 1, ...mapSiteSettings(data) },
    update: mapSiteSettings(data),
  });
  await prisma.profile.upsert({
    where: { id: 1 },
    create: { id: 1, ...mapProfile(data) },
    update: mapProfile(data),
  });

  await prisma.navItem.createMany({ data: mapNavItems(data) });
  await prisma.socialLink.createMany({ data: mapSocialLinks(data) });
  await prisma.contactTopic.createMany({ data: mapContactTopics(data) });

  const pages = overlayPageSectionTitles(
    structuredClone(pagesData) as typeof pagesData,
    data.pageSections,
  );
  await seedPages(prisma, pages);

  const categories = mapSkillCategories(data);
  const categoryIds = new Map<string, number>();
  for (const category of categories) {
    const { slug, ...fields } = category;
    const row = await prisma.skillCategory.create({ data: fields });
    categoryIds.set(slug, row.id);
  }

  const skillIds = new Map<string, number>();
  for (const skill of mapSkills(data)) {
    const categoryId = categoryIds.get(skill.category);
    if (!categoryId) {
      throw new Error(`Unknown skill category ${skill.category}`);
    }
    const row = await prisma.skill.create({
      data: {
        name: skill.name,
        slug: skill.slug,
        categoryId,
        depth: skill.depth,
        showInMarquee: skill.showInMarquee,
        sortOrder: skill.sortOrder,
        isVisible: skill.isVisible,
      },
    });
    skillIds.set(skill.slug, row.id);
  }

  const experienceIds = new Map<string, number>();
  for (const item of mapExperience(data)) {
    const { key, skillSlugs, ...fields } = item;
    const row = await prisma.experience.create({
      data: {
        ...fields,
        skills: {
          connect: skillSlugs.map((slug) => {
            const id = skillIds.get(slug);
            if (!id) {
              throw new Error(`Unknown experience skill ${slug}`);
            }
            return { id };
          }),
        },
      },
    });
    experienceIds.set(key, row.id);
  }

  await prisma.education.createMany({ data: mapEducation(data) });
  await prisma.principle.createMany({ data: mapPrinciples(data) });
  await prisma.profileStat.createMany({ data: mapProfileStats(data) });
  await prisma.processStep.createMany({ data: mapProcessSteps(data) });

  const domainIds = new Map<string, number>();
  for (const domain of mapDomains(data)) {
    const row = await prisma.domain.create({ data: domain });
    domainIds.set(domain.slug, row.id);
  }

  for (const project of mapProjects(data)) {
    const startDate = project.startDate;
    if (!startDate) {
      throw new Error(`Project ${project.slug} is missing startDate`);
    }
    const domainId = project.domainSlug ? (domainIds.get(project.domainSlug) ?? null) : null;
    const experienceId = project.experienceKey
      ? (experienceIds.get(project.experienceKey) ?? null)
      : null;
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
        startDate,
        endDate: project.endDate,
        versionFrom: project.versionFrom,
        versionTo: project.versionTo,
        isFeatured: project.isFeatured,
        isConfidential: project.isConfidential,
        liveUrl: project.liveUrl,
        repoUrl: project.repoUrl,
        problemEn: project.problemEn,
        problemVi: project.problemVi,
        constraintsEn: project.constraintsEn,
        constraintsVi: project.constraintsVi,
        approachEn: project.approachEn,
        approachVi: project.approachVi,
        decisionsEn: project.decisionsEn,
        decisionsVi: project.decisionsVi,
        outcomeEn: project.outcomeEn,
        outcomeVi: project.outcomeVi,
        lessonsEn: project.lessonsEn,
        lessonsVi: project.lessonsVi,
        keyFactsEn: project.keyFactsEn,
        keyFactsVi: project.keyFactsVi,
        factChipsEn: project.factChipsEn,
        factChipsVi: project.factChipsVi,
        notMineEn: project.notMineEn,
        notMineVi: project.notMineVi,
        releaseStatus: project.releaseStatus ?? undefined,
        seoTitleEn: project.seoTitleEn,
        seoTitleVi: project.seoTitleVi,
        seoDescriptionEn: project.seoDescriptionEn,
        seoDescriptionVi: project.seoDescriptionVi,
        status: 'DRAFT',
        publishedAt: null,
        sortOrder: project.sortOrder,
        domainId,
        experienceId,
        skills: {
          connect: project.skillSlugs.map((slug) => {
            const id = skillIds.get(slug);
            if (!id) {
              throw new Error(`Unknown project skill ${slug}`);
            }
            return { id };
          }),
        },
        metrics: {
          create: project.metrics,
        },
      },
    });
  }
}
