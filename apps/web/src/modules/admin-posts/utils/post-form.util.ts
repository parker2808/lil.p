import {
  type AdminMedia,
  type AdminPost,
  type PostCreateInput,
  publishLint,
} from '@portfolio/contracts';

export type PostFormValues = PostCreateInput & {
  id?: number;
  status?: AdminPost['status'];
  updatedAt?: string;
  cover?: AdminMedia | null;
};

export function emptyPostForm(): PostFormValues {
  return {
    slug: '',
    titleEn: '',
    titleVi: '',
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
    isFeatured: false,
    tagIds: [],
    coverId: null,
    cover: null,
  };
}

export function postToForm(post: AdminPost): PostFormValues {
  return {
    id: post.id,
    status: post.status,
    updatedAt: post.updatedAt,
    slug: post.slug,
    titleEn: post.titleEn,
    titleVi: post.titleVi,
    excerptEn: post.excerptEn,
    excerptVi: post.excerptVi,
    bodyEn: post.bodyEn,
    bodyVi: post.bodyVi,
    takeawaysEn: post.takeawaysEn,
    takeawaysVi: post.takeawaysVi,
    seoTitleEn: post.seoTitleEn,
    seoTitleVi: post.seoTitleVi,
    seoDescriptionEn: post.seoDescriptionEn,
    seoDescriptionVi: post.seoDescriptionVi,
    isFeatured: post.isFeatured,
    tagIds: post.tagIds,
    coverId: post.coverId,
    cover: post.cover,
  };
}

export function toPostCreateInput(values: PostFormValues): PostCreateInput {
  return {
    slug: values.slug,
    titleEn: values.titleEn,
    titleVi: values.titleVi,
    excerptEn: values.excerptEn,
    excerptVi: values.excerptVi,
    bodyEn: values.bodyEn,
    bodyVi: values.bodyVi,
    takeawaysEn: values.takeawaysEn,
    takeawaysVi: values.takeawaysVi,
    seoTitleEn: values.seoTitleEn,
    seoTitleVi: values.seoTitleVi,
    seoDescriptionEn: values.seoDescriptionEn,
    seoDescriptionVi: values.seoDescriptionVi,
    isFeatured: values.isFeatured,
    tagIds: values.tagIds,
    coverId: values.coverId,
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

export function clampLines(value: string, max: number): string {
  return value.split('\n').slice(0, max).join('\n');
}

export function postPublishLint(values: PostFormValues) {
  return publishLint({
    titleEn: values.titleEn,
    titleVi: values.titleVi,
    excerptEn: values.excerptEn,
    excerptVi: values.excerptVi,
    bodyEn: values.bodyEn,
    bodyVi: values.bodyVi,
    takeawaysEn: values.takeawaysEn,
    takeawaysVi: values.takeawaysVi,
    seoTitleEn: values.seoTitleEn,
    seoTitleVi: values.seoTitleVi,
    seoDescriptionEn: values.seoDescriptionEn,
    seoDescriptionVi: values.seoDescriptionVi,
  });
}
