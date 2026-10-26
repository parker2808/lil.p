import type {
  AdminMedia,
  AdminProject,
  AdminProjectImage,
  ProjectCreateInput,
} from '@portfolio/contracts';

export type ProjectFormValues = ProjectCreateInput & {
  id?: number;
  status?: AdminProject['status'];
  updatedAt?: string;
  cover?: AdminMedia | null;
  gallery?: AdminProjectImage[];
};

export function emptyProjectForm(): ProjectFormValues {
  return {
    slug: '',
    titleEn: '',
    titleVi: '',
    taglineEn: '',
    taglineVi: '',
    client: '',
    roleEn: '',
    roleVi: '',
    teamSize: null,
    startDate: new Date().toISOString().slice(0, 10),
    endDate: null,
    versionFrom: null,
    versionTo: null,
    isFeatured: false,
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
    domainId: null,
    experienceId: null,
    skillIds: [],
    metrics: [],
    coverId: null,
    images: [],
    cover: null,
    gallery: [],
  };
}

export function projectToForm(project: AdminProject): ProjectFormValues {
  return {
    id: project.id,
    status: project.status,
    updatedAt: project.updatedAt,
    slug: project.slug,
    titleEn: project.titleEn,
    titleVi: project.titleVi,
    taglineEn: project.taglineEn,
    taglineVi: project.taglineVi,
    client: project.client,
    roleEn: project.roleEn,
    roleVi: project.roleVi,
    teamSize: project.teamSize,
    startDate: project.startDate.slice(0, 10),
    endDate: project.endDate?.slice(0, 10) ?? null,
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
    releaseStatus: project.releaseStatus,
    seoTitleEn: project.seoTitleEn,
    seoTitleVi: project.seoTitleVi,
    seoDescriptionEn: project.seoDescriptionEn,
    seoDescriptionVi: project.seoDescriptionVi,
    domainId: project.domainId,
    experienceId: project.experienceId,
    skillIds: project.skillIds,
    coverId: project.coverId,
    cover: project.cover,
    gallery: project.images,
    images: project.images.map((image) => ({
      mediaId: image.mediaId,
      captionEn: image.captionEn,
      captionVi: image.captionVi,
      sortOrder: image.sortOrder,
    })),
    metrics: project.metrics.map((metric) => ({
      labelEn: metric.labelEn,
      labelVi: metric.labelVi,
      before: metric.before,
      after: metric.after,
      value: metric.value,
      sortOrder: metric.sortOrder,
    })),
  };
}

export function slugifyTitle(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
}

export function countLines(value: string): number {
  return value.split('\n').filter((line) => line.trim().length > 0).length;
}

export function toCreateInput(values: ProjectFormValues): ProjectCreateInput {
  return {
    slug: values.slug,
    titleEn: values.titleEn,
    titleVi: values.titleVi,
    taglineEn: values.taglineEn,
    taglineVi: values.taglineVi,
    client: values.client,
    roleEn: values.roleEn,
    roleVi: values.roleVi,
    teamSize: values.teamSize,
    startDate: values.startDate,
    endDate: values.endDate,
    versionFrom: values.versionFrom,
    versionTo: values.versionTo,
    isFeatured: values.isFeatured,
    isConfidential: values.isConfidential,
    liveUrl: values.liveUrl,
    repoUrl: values.repoUrl,
    problemEn: values.problemEn,
    problemVi: values.problemVi,
    constraintsEn: values.constraintsEn,
    constraintsVi: values.constraintsVi,
    approachEn: values.approachEn,
    approachVi: values.approachVi,
    decisionsEn: values.decisionsEn,
    decisionsVi: values.decisionsVi,
    outcomeEn: values.outcomeEn,
    outcomeVi: values.outcomeVi,
    lessonsEn: values.lessonsEn,
    lessonsVi: values.lessonsVi,
    keyFactsEn: values.keyFactsEn,
    keyFactsVi: values.keyFactsVi,
    factChipsEn: values.factChipsEn,
    factChipsVi: values.factChipsVi,
    notMineEn: values.notMineEn,
    notMineVi: values.notMineVi,
    releaseStatus: values.releaseStatus,
    seoTitleEn: values.seoTitleEn,
    seoTitleVi: values.seoTitleVi,
    seoDescriptionEn: values.seoDescriptionEn,
    seoDescriptionVi: values.seoDescriptionVi,
    domainId: values.domainId,
    experienceId: values.experienceId,
    skillIds: values.skillIds,
    metrics: values.metrics,
    coverId: values.coverId,
    images: values.images,
  };
}
