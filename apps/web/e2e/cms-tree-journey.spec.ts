import { expect, test } from '@playwright/test';

import { signIn } from './helpers/auth';

const key = 'builder-journey';
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
