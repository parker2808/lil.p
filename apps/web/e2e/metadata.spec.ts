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
  const draft = await page.request.get(`/api/admin/pages/${key}/builder/draft`);
  expect(draft.status(), await draft.text()).toBe(200);
  const activated = await page.request.post(`/api/admin/pages/${key}/builder/activate`, {
    headers,
    data: { expectedRevision: (await draft.json()).revision, tree: currentTree },
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
