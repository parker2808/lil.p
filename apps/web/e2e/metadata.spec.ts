import { execFileSync } from 'node:child_process';
import { resolve } from 'node:path';

import { expect, test } from '@playwright/test';

import { signIn } from './helpers/auth';

async function checkMetadata(
  page: import('@playwright/test').Page,
  route: string,
  publicPage: boolean,
) {
  await page.goto(route);
  const title = await page.title();
  expect(title, route).toBeTruthy();

  const icon = page.locator('link[rel="icon"]');
  await expect(icon).toHaveAttribute('href', /icon\.svg/);
  const iconUrl = await icon.getAttribute('href');
  expect((await page.request.get(iconUrl!)).ok(), route).toBeTruthy();
  const appleIcon = page.locator('link[rel="apple-touch-icon"]');
  await expect(appleIcon).toHaveAttribute('href', /apple-icon\.png/);
  expect(
    (await page.request.get((await appleIcon.getAttribute('href'))!)).ok(),
    route,
  ).toBeTruthy();

  if (publicPage) {
    await expect(page.locator('meta[property="og:image"]')).toHaveAttribute(
      'content',
      /\/opengraph-image/,
    );
  }
  return title;
}

test('public routes have distinct titles, an icon, and an OG image', async ({ page }) => {
  const titles = new Set<string>();
  for (const route of ['/en', '/en/about', '/en/contact', '/en/notes', '/en/projects']) {
    const title = await checkMetadata(page, route, true);
    expect(titles.has(title), route).toBe(false);
    titles.add(title);
  }
});

test('admin routes have distinct titles and an icon', async ({ page }) => {
  const titles = new Set<string>();
  titles.add(await checkMetadata(page, '/admin/login', false));
  await signIn(page);
  for (const route of [
    '/admin',
    '/admin/projects',
    '/admin/posts',
    '/admin/pages/home',
    '/admin/pages/about',
    '/admin/pages/contact',
    '/admin/media',
    '/admin/inbox',
    '/admin/users',
    '/admin/site',
    '/admin/profile',
    '/admin/analytics',
    '/admin/audit',
  ]) {
    const title = await checkMetadata(page, route, false);
    expect(titles.has(title), route).toBe(false);
    titles.add(title);
  }
});

test('real invalid draft block is localized only in EN/VI preview, without diagnostics', async ({
  page,
}, testInfo) => {
  test.setTimeout(120_000);
  await signIn(page);
  const key = `metadata-invalid-${Date.now()}-${testInfo.retry}`;
  const headers = { Origin: new URL(page.url()).origin };
  const created = await page.request.post('/api/admin/pages', {
    headers,
    data: { key, title: 'Invalid preview fixture', locale: 'en', template: 'starter' },
  });
  expect(created.status(), await created.text()).toBe(201);
  const prose = (await created.json()).blocks.find(
    (block: { type: string }) => block.type === 'prose',
  );
  expect(prose).toBeDefined();
  const filled = await page.request.patch(`/api/admin/pages/${key}/blocks/${prose.id}`, {
    headers,
    data: {
      props: {
        body: {
          en: 'Published English body copy for the invalid preview fixture.',
          vi: 'Nội dung công khai tiếng Việt cho bản xem trước không hợp lệ.',
        },
      },
    },
  });
  expect(filled.status(), await filled.text()).toBe(200);
  const seo = await page.request.patch(`/api/admin/pages/${key}`, {
    headers,
    data: {
      seoTitleEn: 'Published English fixture',
      seoTitleVi: 'Bản công khai tiếng Việt',
      seoDescriptionEn: 'Public English description',
      seoDescriptionVi: 'Mô tả công khai tiếng Việt',
    },
  });
  expect(seo.status(), await seo.text()).toBe(200);
  const published = await page.request.post(`/api/admin/pages/${key}/publish`, {
    headers,
    data: {},
  });
  expect(published.status(), await published.text()).toBe(200);

  execFileSync('pnpm', ['exec', 'tsx', 'test/helpers/seed-invalid-preview.ts', key], {
    cwd: resolve(import.meta.dirname, '../../api'),
    env: process.env,
    stdio: 'pipe',
  });

  for (const [locale, title, description, notice, help] of [
    [
      'en',
      'Published English fixture',
      'Public English description',
      'This block cannot be previewed',
      'Review this block in the editor, then try previewing again.',
    ],
    [
      'vi',
      'Bản công khai tiếng Việt',
      'Mô tả công khai tiếng Việt',
      'Không thể xem trước khối này',
      'Kiểm tra khối này trong trình chỉnh sửa, rồi thử xem trước lại.',
    ],
  ] as const) {
    const path = `/${locale}/${key}`;
    const draftApi = await page.request.get(`/api/admin/preview/pages/${key}?locale=${locale}`);
    expect(draftApi.status()).toBe(200);
    const draft = await draftApi.json();
    expect(draft.invalidBlocks).toHaveLength(1);
    expect(draft.invalidBlocks[0].type).toBe('f4-internal-legacy-type');
    expect(draft.seo).toMatchObject({ title, description });

    await page.goto(`/api/draft?path=${encodeURIComponent(path)}`);
    const previewResponse = await page.goto(path);
    expect(previewResponse?.status()).toBe(200);
    const previewHtml = await previewResponse!.text();
    expect(previewHtml).toContain(notice);
    expect(previewHtml).toContain(help);
    expect(previewHtml).not.toContain('f4-internal-legacy-type');
    expect(previewHtml).not.toContain('invalidBlocks');
    expect(previewHtml).not.toContain('issues');
    await expect(page.getByRole('status').filter({ hasText: notice })).toContainText(help);
    expect(await page.content()).not.toContain('f4-internal-legacy-type');
    await expect(page.locator('meta[name="description"]')).toHaveAttribute('content', description);
    expect(await page.title()).toContain(title);

    await page.goto(`/api/draft?exit=1&path=${encodeURIComponent(path)}`);
    const publicResponse = await page.goto(path);
    expect(publicResponse?.status()).toBe(200);
    expect(await publicResponse!.text()).not.toContain(notice);
    await expect(page.getByText(notice)).toHaveCount(0);
    await expect(page.locator('meta[name="description"]')).toHaveAttribute('content', description);
    expect(await page.title()).toContain(title);
  }
});

test('EN/VI historical draft SEO matches the versioned body; public query stays current', async ({
  page,
}) => {
  test.setTimeout(120_000);
  await signIn(page);
  const key = `metadata-version-${Date.now()}`;
  const headers = { Origin: new URL(page.url()).origin };
  const currentTree = {
    schemaVersion: 1,
    root: {
      id: 'metadata-page',
      type: 'page',
      responsive: { base: {} },
      sections: [
        {
          id: 'metadata-section',
          type: 'section',
          responsive: { base: {} },
          content: [
            {
              id: 'metadata-heading',
              type: 'component',
              componentType: 'heading',
              responsive: { base: { text: 'Current metadata heading', level: 1 } },
            },
          ],
        },
      ],
    },
  };
  const created = await page.request.post('/api/admin/pages', {
    headers,
    data: { key, title: 'Metadata versions', locale: 'en', template: 'starter' },
  });
  expect(created.status(), await created.text()).toBe(201);
  const prose = (await created.json()).blocks.find(
    (block: { type: string }) => block.type === 'prose',
  );
  expect(prose).toBeDefined();
  const filled = await page.request.patch(`/api/admin/pages/${key}/blocks/${prose.id}`, {
    headers,
    data: { props: { body: { en: 'Historical body', vi: 'Nội dung lịch sử' } } },
  });
  expect(filled.status(), await filled.text()).toBe(200);

  async function setSeo(label: 'Historical' | 'Current') {
    const response = await page.request.patch(`/api/admin/pages/${key}`, {
      headers,
      data: {
        seoTitleEn: `${label} English SEO`,
        seoDescriptionEn: `${label} English description`,
        seoTitleVi: `${label} Vietnamese SEO`,
        seoDescriptionVi: `${label} Vietnamese description`,
      },
    });
    expect(response.status(), await response.text()).toBe(200);
  }

  await setSeo('Historical');
  const legacyPublished = await page.request.post(`/api/admin/pages/${key}/publish`, {
    headers,
    data: {},
  });
  expect(legacyPublished.status(), await legacyPublished.text()).toBe(200);
  expect((await legacyPublished.json()).publishedVersion).toBe(1);
  await setSeo('Current');
  const activated = await page.request.post(`/api/admin/pages/${key}/builder/activate`, {
    headers,
    data: { expectedRevision: '0', tree: currentTree },
  });
  expect(activated.status(), await activated.text()).toBe(200);
  const published = await page.request.post(`/api/admin/pages/${key}/builder/publish`, {
    headers,
    data: { expectedRevision: (await activated.json()).revision },
  });
  expect(published.status(), await published.text()).toBe(200);
  expect((await published.json()).publishedVersion).toBe(2);

  for (const locale of ['en', 'vi'] as const) {
    const path = `/${locale}/${key}`;
    const localized = locale === 'en' ? 'English' : 'Vietnamese';
    await page.goto(`${path}?v=1`);
    await expect(
      page.getByRole('heading', { name: 'Current metadata heading', level: 1 }),
    ).toBeVisible();
    expect(await page.title()).toContain(`Current ${localized} SEO`);
    await expect(page.locator('meta[name="description"]')).toHaveAttribute(
      'content',
      `Current ${localized} description`,
    );
    await page.goto(`/api/draft?path=${encodeURIComponent(path)}`);
    await page.goto(`${path}?v=1`);
    await expect(page.getByRole('heading', { name: 'Metadata versions', level: 1 })).toBeVisible();
    await expect(
      page.getByText(locale === 'en' ? 'Historical body' : 'Nội dung lịch sử'),
    ).toBeVisible();
    expect(await page.title()).toContain(`Historical ${localized} SEO`);
    await expect(page.locator('meta[name="description"]')).toHaveAttribute(
      'content',
      `Historical ${localized} description`,
    );
    await page.goto(`/api/draft?exit=1&path=${encodeURIComponent(path)}`);
  }
});

test('EN/VI tree page without SEO derives public and draft metadata from the visible H1', async ({
  page,
}) => {
  test.setTimeout(120_000);
  await signIn(page);
  const key = `metadata-tree-${Date.now()}`;
  const headers = { Origin: new URL(page.url()).origin };
  const created = await page.request.post('/api/admin/pages', {
    headers,
    data: { key, title: 'Tree metadata', locale: 'en', template: 'starter' },
  });
  expect(created.status(), await created.text()).toBe(201);
  const cleared = await page.request.patch(`/api/admin/pages/${key}`, {
    headers,
    data: {
      seoTitleEn: null,
      seoTitleVi: null,
      seoDescriptionEn: null,
      seoDescriptionVi: null,
    },
  });
  expect(cleared.status(), await cleared.text()).toBe(200);

  const tree = {
    schemaVersion: 1,
    root: {
      id: 'page',
      type: 'page',
      responsive: { base: {} },
      sections: [
        {
          id: 'section',
          type: 'section',
          responsive: { base: {} },
          content: [
            {
              id: 'heading',
              type: 'component',
              componentType: 'page-header',
              responsive: {
                base: {
                  eyebrow: { en: 'Work', vi: 'Công việc' },
                  title: { en: 'Selected projects', vi: 'Dự án tiêu biểu' },
                  intro: { en: 'Project overview', vi: 'Tổng quan dự án' },
                },
              },
            },
          ],
        },
      ],
    },
  };
  const activated = await page.request.post(`/api/admin/pages/${key}/builder/activate`, {
    headers,
    data: { expectedRevision: '0', tree },
  });
  expect(activated.status(), await activated.text()).toBe(200);
  for (const [locale, heading, description] of [
    ['en', 'Selected projects', 'Project overview'],
    ['vi', 'Dự án tiêu biểu', 'Tổng quan dự án'],
  ] as const) {
    const path = `/${locale}/${key}`;
    await page.goto(`/api/draft?path=${encodeURIComponent(path)}`);
    await page.goto(path);
    await expect(page.getByRole('heading', { name: heading, level: 1 })).toBeVisible();
    expect(await page.title()).toContain(heading);
    await expect(page.locator('meta[name="description"]')).toHaveAttribute('content', description);
    await page.goto(`/api/draft?exit=1&path=${encodeURIComponent(path)}`);
  }
  const published = await page.request.post(`/api/admin/pages/${key}/builder/publish`, {
    headers,
    data: { expectedRevision: (await activated.json()).revision },
  });
  expect(published.status(), await published.text()).toBe(200);
  for (const [locale, heading, description] of [
    ['en', 'Selected projects', 'Project overview'],
    ['vi', 'Dự án tiêu biểu', 'Tổng quan dự án'],
  ] as const) {
    await page.goto(`/${locale}/${key}`);
    await expect(page.getByRole('heading', { name: heading, level: 1 })).toBeVisible();
    expect(await page.title()).toContain(heading);
    await expect(page.locator('meta[name="description"]')).toHaveAttribute('content', description);
  }
});
