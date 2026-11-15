import { BLOCK_REGISTRY } from '@portfolio/contracts';
import { expect, test } from '@playwright/test';

import { signIn } from './helpers/auth';

test('all 20 host definitions publish through the live API and render in Next preview/public EN/VI', async ({
  page,
}) => {
  test.setTimeout(10 * 60_000);
  await signIn(page);
  const headers = { Origin: new URL(page.url()).origin };
  expect(Object.keys(BLOCK_REGISTRY)).toHaveLength(20);

  for (const definition of Object.values(BLOCK_REGISTRY)) {
    const key = `host-gate-${definition.type}`;
    const host = {
      id: `host-${definition.type}`,
      type: 'component',
      componentType: definition.type,
      responsive: { base: definition.defaults },
    };
    const heading = {
      id: 'host-heading',
      type: 'component',
      componentType: 'heading',
      responsive: { base: { text: 'Host gate', level: 1 } },
    };
    const tree = {
      schemaVersion: 1,
      root: {
        id: 'host-root',
        type: 'page',
        responsive: { base: {} },
        sections: [
          {
            id: 'host-section',
            type: 'section',
            responsive: { base: {} },
            content: definition.role === 'h1' ? [host] : [heading, host],
          },
        ],
      },
    };
    const created = await page.request.post('/api/admin/pages', {
      headers,
      data: { key, title: definition.type, locale: 'en', template: 'empty' },
    });
    expect(created.status(), `${definition.type}: ${await created.text()}`).toBe(201);
    const activated = await page.request.post(`/api/admin/pages/${key}/builder/activate`, {
      headers,
      data: { expectedRevision: '0', tree },
    });
    expect(activated.status(), `${definition.type}: ${await activated.text()}`).toBe(200);
    const published = await page.request.post(`/api/admin/pages/${key}/builder/publish`, {
      headers,
      data: { expectedRevision: '1' },
    });
    expect(published.status(), `${definition.type}: ${await published.text()}`).toBe(200);

    for (const locale of ['en', 'vi']) {
      const preview = await page.request.get(
        `/api/admin/preview/pages/${key}?locale=${locale}&version=1`,
      );
      const publicPage = await page.request.get(`/api/public/pages/${key}?locale=${locale}`);
      expect(preview.status(), `${definition.type}/${locale}`).toBe(200);
      expect(publicPage.status(), `${definition.type}/${locale}`).toBe(200);
      expect(await preview.json()).toEqual({ ...(await publicPage.json()), invalidBlocks: [] });

      await page.goto(`/${locale}/${key}`);
      await expect(page.locator(`[data-host-block-type="${definition.type}"]`)).toHaveCount(1);
      const publishedStructure = await page
        .locator('main.cms-core [data-node-id]')
        .evaluateAll((nodes) => nodes.map((node) => node.getAttribute('data-node-id')));
      const publishedProps = await page
        .locator(`[data-host-block-type="${definition.type}"]`)
        .getAttribute('data-host-props-hash');
      expect(publishedProps).toMatch(/^[0-9a-f]{64}$/);
      await page.goto(`/api/draft?path=${encodeURIComponent(`/${locale}/${key}`)}`);
      await page.goto(`/${locale}/${key}?v=1`);
      await expect(page.locator(`[data-host-block-type="${definition.type}"]`)).toHaveCount(1);
      expect(
        await page
          .locator('main.cms-core [data-node-id]')
          .evaluateAll((nodes) => nodes.map((node) => node.getAttribute('data-node-id'))),
      ).toEqual(publishedStructure);
      expect(
        await page
          .locator(`[data-host-block-type="${definition.type}"]`)
          .getAttribute('data-host-props-hash'),
      ).toBe(publishedProps);
      await page.goto(`/api/draft?exit=1&path=${encodeURIComponent(`/${locale}/${key}`)}`);
    }
  }
});
