export function projectTags(slug: string): string[] {
  return ['projects', `project:${slug}`];
}

export function postTags(slug: string): string[] {
  return ['posts', `post:${slug}`];
}

export function pageTags(key: string): string[] {
  return [`page:${key}`];
}

export const SITE_TAGS = ['site'];
export const SKILL_TAGS = ['skills'];
export const DOMAIN_TAGS = ['domains'];
