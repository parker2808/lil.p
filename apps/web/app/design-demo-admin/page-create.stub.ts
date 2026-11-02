// NEEDS_BACKEND: POST /admin/pages. This typed fixture never persists data.
export type DemoPageTemplate = 'starter' | 'empty';
export type DemoCreatedPage = {
  title: string;
  key: string;
  locale: 'en' | 'vi';
  template: DemoPageTemplate;
};

export function slugFromTitle(title: string): string {
  return title
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function validateDemoPage(
  page: DemoCreatedPage,
  existingKeys: readonly string[],
): string | null {
  if (!page.title.trim()) return 'Enter a page title.';
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(page.key))
    return 'Use lowercase letters, numbers, and hyphens for the slug.';
  if (existingKeys.includes(page.key)) return 'This slug is already in use.';
  return null;
}

export function createDemoPage(page: DemoCreatedPage): DemoCreatedPage {
  return { ...page, title: page.title.trim() };
}
