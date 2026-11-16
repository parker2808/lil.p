import { expect, test } from '@playwright/test';

import { signIn } from './helpers/auth';

const firstTree = {
  schemaVersion: 1,
  root: {
    id: 'page-root',
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
            componentType: 'heading',
            responsive: { base: { text: 'First tree heading', level: 1 } },
          },
        ],
      },
    ],
  },
};
const secondTree = {
  ...firstTree,
  root: {
    ...firstTree.root,
    sections: [
      {
        ...firstTree.root.sections[0]!,
        content: [
          {
            ...firstTree.root.sections[0]!.content[0]!,
            responsive: { base: { text: 'Second tree heading', level: 1 } },
          },
        ],
      },
    ],
  },
};

test('real tree save, publish, EN/VI SSR parity and revision-aware restore', async ({ page }) => {
  await signIn(page);
  const key = `builder-journey-${Date.now()}`;
  const headers = { Origin: new URL(page.url()).origin };
  const created = await page.request.post('/api/admin/pages', {
    headers,
    data: { key, title: 'Builder journey', locale: 'en', template: 'empty' },
  });
  expect(created.status(), await created.text()).toBe(201);
  const activated = await page.request.post(`/api/admin/pages/${key}/builder/activate`, {
    headers,
    data: { expectedRevision: '0', tree: firstTree },
  });
  expect(activated.status(), await activated.text()).toBe(200);
  const saved = await page.request.put(`/api/admin/pages/${key}/builder/draft`, {
    headers,
    data: { expectedRevision: '1', tree: firstTree },
  });
  expect(saved.status(), await saved.text()).toBe(200);
  expect((await saved.json()).revision).toBe('2');
  const published = await page.request.post(`/api/admin/pages/${key}/builder/publish`, {
    headers,
    data: { expectedRevision: '2' },
  });
  expect(published.status(), await published.text()).toBe(200);
  const htmlByLocale: Record<string, string> = {};
  for (const locale of ['en', 'vi']) {
    const preview = await page.request.get(
      `/api/admin/preview/pages/${key}?locale=${locale}&version=1`,
    );
    const publicPage = await page.request.get(`/api/public/pages/${key}?locale=${locale}`);
    expect(preview.status()).toBe(200);
    expect(publicPage.status()).toBe(200);
    expect(await preview.json()).toEqual({ ...(await publicPage.json()), invalidBlocks: [] });
    await expect(async () => {
      await page.goto(`/${locale}/${key}`);
      await expect(
        page.getByRole('heading', { level: 1, name: 'First tree heading' }),
      ).toBeVisible();
    }).toPass({ timeout: 30_000 });
    htmlByLocale[locale] = await page.locator('main.cms-core').innerHTML();
    await page.goto(`/api/draft?path=${encodeURIComponent(`/${locale}/${key}`)}`);
    await page.goto(`/${locale}/${key}?v=1`);
    await expect(page.getByRole('heading', { level: 1, name: 'First tree heading' })).toBeVisible();
    expect(await page.locator('main.cms-core').innerHTML()).toBe(htmlByLocale[locale]);
    await page.goto(`/api/draft?exit=1&path=${encodeURIComponent(`/${locale}/${key}`)}`);
  }
  const changed = await page.request.put(`/api/admin/pages/${key}/builder/draft`, {
    headers,
    data: { expectedRevision: '3', tree: secondTree },
  });
  expect(changed.status(), await changed.text()).toBe(200);
  const restore = await page.request.post(`/api/admin/pages/${key}/versions/1/builder/restore`, {
    headers,
    data: { expectedRevision: '4' },
  });
  expect(restore.status(), await restore.text()).toBe(200);
  expect((await restore.json()).tree).toEqual(firstTree);
  await page.goto(`/admin/builder/${key}`);
  await expect(
    page
      .getByRole('region', { name: /^(Page canvas|Khung trang)$/ })
      .getByRole('heading', { name: 'First tree heading', level: 2 }),
  ).toBeVisible();
  expect(
    (await (await page.request.get(`/api/admin/pages/${key}/builder/draft`)).json()).tree,
  ).toEqual(firstTree);
  expect((await (await page.request.get(`/api/public/pages/${key}`)).json()).tree).toEqual(
    firstTree,
  );
  const nextSave = await page.request.put(`/api/admin/pages/${key}/builder/draft`, {
    headers,
    data: { expectedRevision: '5', tree: secondTree },
  });
  expect(nextSave.status(), await nextSave.text()).toBe(200);
  const republished = await page.request.post(`/api/admin/pages/${key}/builder/publish`, {
    headers,
    data: { expectedRevision: '6' },
  });
  expect(republished.status(), await republished.text()).toBe(200);
  const versionTwo = await page.request.get(`/api/admin/pages/${key}/versions/2`);
  expect(versionTwo.status(), await versionTwo.text()).toBe(200);
  expect((await versionTwo.json()).snapshot.tree).toEqual(secondTree);
  for (const locale of ['en', 'vi']) {
    const publicPage = await page.request.get(`/api/public/pages/${key}?locale=${locale}`);
    const preview = await page.request.get(
      `/api/admin/preview/pages/${key}?locale=${locale}&version=2`,
    );
    expect(await preview.json()).toEqual({ ...(await publicPage.json()), invalidBlocks: [] });
    await expect(async () => {
      await page.goto(`/${locale}/${key}`);
      await expect(
        page.getByRole('heading', { level: 1, name: 'Second tree heading' }),
      ).toBeVisible();
    }).toPass({ timeout: 30_000 });
    expect(await page.locator('main.cms-core').innerHTML()).not.toBe(htmlByLocale[locale]);
  }
});

test('preview and public tree render paired EN/VI breakpoint markup and screenshots', async ({
  page,
}, testInfo) => {
  test.setTimeout(180_000);
  const hydrationErrors: string[] = [];
  page.on('console', (message) => {
    if (message.type() === 'error' && /hydration|mismatch/i.test(message.text())) {
      hydrationErrors.push(message.text());
    }
  });
  page.on('pageerror', (error) => {
    if (/hydration|mismatch/i.test(error.message)) hydrationErrors.push(error.message);
  });
  await signIn(page);
  const key = `builder-parity-${Date.now()}`;
  const headers = { Origin: new URL(page.url()).origin };
  const tree = structuredClone(firstTree);
  const responsive = tree.root.sections[0]!.content[0]!.responsive as {
    base: { text: string; level: number };
    mobile?: { text: string };
    tablet?: { text: string };
    desktop?: { text: string };
  };
  responsive.mobile = { text: 'Mobile tree heading' };
  responsive.tablet = { text: 'Tablet tree heading' };
  responsive.desktop = { text: 'Desktop tree heading' };
  expect(
    (
      await page.request.post('/api/admin/pages', {
        headers,
        data: { key, title: 'Tree parity', locale: 'en', template: 'empty' },
      })
    ).status(),
  ).toBe(201);
  const activated = await page.request.post(`/api/admin/pages/${key}/builder/activate`, {
    headers,
    data: { expectedRevision: '0', tree },
  });
  expect(activated.status(), await activated.text()).toBe(200);
  expect((await activated.json()).tree).toEqual(tree);
  const published = await page.request.post(`/api/admin/pages/${key}/builder/publish`, {
    headers,
    data: { expectedRevision: '1' },
  });
  expect(published.status(), await published.text()).toBe(200);
  for (const locale of ['en', 'vi']) {
    const preview = await page.request.get(
      `/api/admin/preview/pages/${key}?locale=${locale}&version=1`,
    );
    const publicPage = await page.request.get(`/api/public/pages/${key}?locale=${locale}`);
    expect(preview.status()).toBe(200);
    expect(publicPage.status()).toBe(200);
    expect(await preview.json()).toEqual({ ...(await publicPage.json()), invalidBlocks: [] });
    for (const [width, text] of [
      [390, 'Mobile tree heading'],
      [768, 'Tablet tree heading'],
      [1440, 'Desktop tree heading'],
    ] as const) {
      await page.setViewportSize({ width, height: 900 });
      const path = `/${locale}/${key}`;
      const ssr = await page.request.get(path);
      expect(ssr.status()).toBe(200);
      expect(await ssr.text()).toContain('main');
      await page.goto(path);
      await expect(page.getByRole('heading', { level: 1, name: text })).toBeVisible();
      const publicMarkup = await page.locator('main.cms-core').innerHTML();
      await testInfo.attach(`${locale}-${width}-public`, {
        body: await page.locator('main.cms-core').screenshot({ animations: 'disabled' }),
        contentType: 'image/png',
      });
      await page.goto(`/api/draft?path=${encodeURIComponent(path)}`);
      await page.goto(`${path}?v=1`);
      await expect(page.getByRole('heading', { level: 1, name: text })).toBeVisible();
      expect(await page.locator('main.cms-core').innerHTML()).toBe(publicMarkup);
      await testInfo.attach(`${locale}-${width}-preview`, {
        body: await page.locator('main.cms-core').screenshot({ animations: 'disabled' }),
        contentType: 'image/png',
      });
      await page.goto(`/api/draft?exit=1&path=${encodeURIComponent(path)}`);
    }
  }
  expect(hydrationErrors).toEqual([]);
});
