import { Prisma, type PrismaClient } from '../../../src/generated/prisma/client';
import { applyOwnerCopy } from '../data/owner-copy.data';
import {
  loadPortfolioData,
  mapExperience,
  mapProfile,
  mapProfileStats,
  mapProjects,
  parseMonthDate,
} from '../data/portfolio.mapper';
import { loadVerifiedOwnerData, VERIFIED_PROJECT_SLUGS } from '../data/verified-owner.data';

type ProjectWrite = ReturnType<typeof mapProjects>[number];

const PROJECT_FIELDS = [
  'titleEn',
  'titleVi',
  'taglineEn',
  'taglineVi',
  'client',
  'roleEn',
  'roleVi',
  'teamSize',
  'startDate',
  'endDate',
  'versionFrom',
  'versionTo',
  'isFeatured',
  'isConfidential',
  'liveUrl',
  'repoUrl',
  'problemEn',
  'problemVi',
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
  'seoTitleEn',
  'seoTitleVi',
  'seoDescriptionEn',
  'seoDescriptionVi',
  'sortOrder',
] as const;

const EXPERIENCE_FIELDS = [
  'companyUrl',
  'location',
  'employmentType',
  'roleEn',
  'roleVi',
  'summaryEn',
  'summaryVi',
  'highlightsEn',
  'highlightsVi',
  'startDate',
  'endDate',
  'sortOrder',
  'isVisible',
] as const;

function same(a: unknown, b: unknown): boolean {
  if (a instanceof Date && b instanceof Date) return a.getTime() === b.getTime();
  return a === b;
}

function sameJson(a: unknown, b: unknown): boolean {
  return JSON.stringify(a) === JSON.stringify(b);
}

function projectCreate(project: ProjectWrite): Prisma.ProjectCreateInput {
  if (!project.startDate) throw new Error('Verified project is missing a date');
  const data: Record<string, unknown> = {
    slug: project.slug,
    status: project.status,
    publishedAt: project.publishedAt,
  };
  for (const field of PROJECT_FIELDS) data[field] = project[field];
  if (project.releaseStatus) data.releaseStatus = project.releaseStatus;
  if (project.metrics.length) data.metrics = { create: project.metrics };
  if (project.skillSlugs.length)
    data.skills = { connect: project.skillSlugs.map((slug) => ({ slug })) };
  return data as Prisma.ProjectCreateInput;
}

/**
 * Apply verified owner content without deleting rows or replacing independently
 * edited CMS fields. The nine owner projects are keyed by slug; the tenth is a
 * public repository project. Existing unrelated rows and edits remain intact.
 */
export async function seedReal(prisma: PrismaClient): Promise<void> {
  const data = loadVerifiedOwnerData();
  const desired = mapProjects(data);
  const oldRaw = new Map(mapProjects(loadPortfolioData()).map((row) => [row.slug, row]));
  const oldOwner = new Map(
    mapProjects(applyOwnerCopy(loadPortfolioData())).map((row) => [row.slug, row]),
  );
  const rawExperience = mapExperience(loadPortfolioData());
  const oldExperience = mapExperience(applyOwnerCopy(loadPortfolioData()));
  const desiredExperience = mapExperience(data);

  await prisma.$transaction(async (tx) => {
    const oldSiteProject = await tx.project.findUnique({ where: { slug: 'lil-p' } });
    if (oldSiteProject?.status === 'PUBLISHED') {
      const untouched =
        oldSiteProject.updatedAt.getTime() === oldSiteProject.createdAt.getTime() &&
        oldSiteProject.titleEn === 'lil.p';
      if (!untouched) {
        throw new Error('An existing project needs manual review before the ten-project seed');
      }
      await tx.project.update({ where: { slug: 'lil-p' }, data: { status: 'ARCHIVED' } });
    }

    for (const project of desired) {
      const existing = await tx.project.findUnique({ where: { slug: project.slug } });
      if (!existing) {
        const create = projectCreate(project);
        if (project.domainSlug) create.domain = { connect: { slug: project.domainSlug } };
        if (project.experienceKey) {
          const match = rawExperience.find((row) => row.key === project.experienceKey);
          if (!match) throw new Error('Verified project experience is missing');
          const related = await tx.experience.findFirst({
            where: { company: match.company, startDate: match.startDate },
          });
          if (!related) throw new Error('Verified project experience is missing');
          create.experience = { connect: { id: related.id } };
        }
        await tx.project.create({ data: create });
        continue;
      }
      const original = oldRaw.get(project.slug);
      const previousOwner = oldOwner.get(project.slug);
      const update: Record<string, unknown> = {};
      for (const field of PROJECT_FIELDS) {
        const current = existing[field];
        const target = project[field];
        if (
          !same(current, target) &&
          (same(current, original?.[field]) || same(current, previousOwner?.[field]))
        ) {
          update[field] = target;
        }
      }
      if (Object.keys(update).length) {
        await tx.project.update({
          where: { slug: project.slug },
          data: update as Prisma.ProjectUncheckedUpdateInput,
        });
      }
      if (project.slug === 'ctrack-crystal' && existing.experienceId && !project.experienceKey) {
        const linked = await tx.experience.findUnique({ where: { id: existing.experienceId } });
        const legacy = rawExperience.find((row) => row.key === original?.experienceKey);
        if (linked && legacy && linked.company === legacy.company) {
          await tx.project.update({ where: { slug: project.slug }, data: { experienceId: null } });
        }
      }
      if (
        existing.releaseStatus &&
        !project.releaseStatus &&
        (sameJson(existing.releaseStatus, original?.releaseStatus) ||
          sameJson(existing.releaseStatus, previousOwner?.releaseStatus))
      ) {
        await tx.project.update({
          where: { slug: project.slug },
          data: { releaseStatus: Prisma.JsonNull },
        });
      }
      const legacyMetrics = [...(original?.metrics ?? []), ...(previousOwner?.metrics ?? [])];
      if (legacyMetrics.length) {
        const storedMetrics = await tx.projectMetric.findMany({
          where: { projectId: existing.id },
        });
        for (const metric of storedMetrics) {
          if (
            legacyMetrics.some(
              (old) =>
                old.labelEn === metric.labelEn &&
                old.value === metric.value &&
                old.before === metric.before &&
                old.after === metric.after,
            )
          ) {
            await tx.projectMetric.delete({ where: { id: metric.id } });
          }
        }
      }
    }

    for (const item of desiredExperience) {
      const original = oldExperience.find((row) => row.key === item.key);
      const raw = rawExperience.find((row) => row.key === item.key);
      if (!original || !raw) throw new Error('Verified experience has no baseline match');
      const existing =
        (await tx.experience.findFirst({
          where: { company: raw.company, startDate: raw.startDate },
        })) ??
        (await tx.experience.findFirst({
          where: { company: original.company, startDate: original.startDate },
        }));
      if (!existing) throw new Error('Verified experience is missing');
      const update: Record<string, unknown> = {};
      for (const field of EXPERIENCE_FIELDS) {
        if (
          (same(existing[field], raw[field]) || same(existing[field], original[field])) &&
          !same(existing[field], item[field])
        ) {
          update[field] = item[field];
        }
      }
      if (Object.keys(update).length) {
        await tx.experience.update({ where: { id: existing.id }, data: update });
      }
      if (item.key === 'cmc-cfw') {
        const linkedNest = await tx.experience.findUnique({
          where: { id: existing.id },
          select: { skills: { where: { slug: 'nestjs' }, select: { id: true } } },
        });
        const nestSkill = linkedNest?.skills[0];
        if (nestSkill) {
          await tx.experience.update({
            where: { id: existing.id },
            data: { skills: { disconnect: { id: nestSkill.id } } },
          });
        }
      }
    }

    const removedStats = mapProfileStats(loadPortfolioData()).filter(
      (row) => !mapProfileStats(data).some((wanted) => wanted.labelEn === row.labelEn),
    );
    for (const stat of removedStats) {
      const existing = await tx.profileStat.findFirst({ where: { labelEn: stat.labelEn } });
      if (existing && same(existing.value, stat.value) && existing.isVisible) {
        await tx.profileStat.update({ where: { id: existing.id }, data: { isVisible: false } });
      }
    }

    const active = await tx.project.findMany({
      where: { status: 'PUBLISHED' },
      select: { slug: true },
    });
    const activeSlugs = new Set(active.map((row) => row.slug));
    if (
      activeSlugs.size !== VERIFIED_PROJECT_SLUGS.length ||
      VERIFIED_PROJECT_SLUGS.some((slug) => !activeSlugs.has(slug))
    ) {
      throw new Error('Published projects differ from the verified ten-project set');
    }

    const site = await tx.siteSettings.findUnique({ where: { id: 1 } });
    if (!site) throw new Error('Site settings are required before the real seed');
    const siteUpdate: Prisma.SiteSettingsUpdateInput = {};
    if (!site.heroStats)
      siteUpdate.heroStats = data.siteSettings.heroStats as Prisma.InputJsonValue;
    if (site.contactEmail === '<email>') siteUpdate.contactEmail = '';
    for (const field of [
      'replyTimeNoteEn',
      'replyTimeNoteVi',
      'availabilityNoteEn',
      'availabilityNoteVi',
    ] as const) {
      if (/\b(?:TODO|TBD|placeholder)\b/i.test(site[field])) siteUpdate[field] = '';
    }
    if (Object.keys(siteUpdate).length) {
      await tx.siteSettings.update({ where: { id: 1 }, data: siteUpdate });
    }

    const profile = await tx.profile.findUnique({ where: { id: 1 } });
    if (!profile) throw new Error('Profile is required before the real seed');
    const profileUpdate: Prisma.ProfileUpdateInput = {};
    const rawProfile = mapProfile(loadPortfolioData());
    const ownerProfile = mapProfile(applyOwnerCopy(loadPortfolioData()));
    for (const field of ['bioEn', 'bioVi'] as const) {
      if (same(profile[field], rawProfile[field]) || same(profile[field], ownerProfile[field])) {
        if (!same(profile[field], data.profile[field]))
          profileUpdate[field] = String(data.profile[field]);
      }
    }
    if (profile.phone === '<phone>') profileUpdate.phone = '';
    if (/\bTODO\b/i.test(profile.languagesEn))
      profileUpdate.languagesEn = data.profile.languagesEn as string;
    if (/\bTODO\b/i.test(profile.languagesVi))
      profileUpdate.languagesVi = data.profile.languagesVi as string;
    if (Object.keys(profileUpdate).length) {
      await tx.profile.update({ where: { id: 1 }, data: profileUpdate });
    }

    const school = data.education[0];
    const startDate = parseMonthDate(String(school.startDate));
    if (!startDate) throw new Error('Verified education is missing a date');
    const education = await tx.education.findFirst({
      where: { school: String(school.school), startDate },
    });
    if (education) {
      const educationUpdate: Prisma.EducationUpdateInput = {};
      if (/\bTODO\b/i.test(education.degreeEn)) educationUpdate.degreeEn = String(school.degreeEn);
      if (/\bTODO\b/i.test(education.degreeVi)) educationUpdate.degreeVi = String(school.degreeVi);
      if (Object.keys(educationUpdate).length) {
        await tx.education.update({ where: { id: education.id }, data: educationUpdate });
      }
    }
  });
}
