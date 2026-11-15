import AxeBuilder from '@axe-core/playwright';
import { BLOCK_REGISTRY } from '@portfolio/contracts';
import { expect, test, type Page, type TestInfo } from '@playwright/test';

import { signIn } from './helpers/auth';

const key = 'd6-parity-matrix';
const responsive = {
  base: { text: 'Base heading', level: 1 },
  mobile: { text: 'Mobile heading' },
  tablet: { text: 'Tablet heading' },
  desktop: { text: 'Desktop heading' },
};
const tree = {
  schemaVersion: 1,
  root: {
    id: 'parity-page',
    type: 'page',
    responsive: { base: {} },
    sections: [
      {
        id: 'parity-section',
        type: 'section',
        responsive: { base: {} },
        content: [
          { id: 'parity-heading', type: 'component', componentType: 'heading', responsive },
          {
            id: 'parity-paragraph',
            type: 'component',
            componentType: 'paragraph',
            responsive: {
              base: { text: 'Base copy' },
              mobile: { text: 'Mobile copy' },
              tablet: { text: 'Tablet copy' },
              desktop: { text: 'Desktop copy' },
            },
          },
        ],
      },
    ],
  },
};

async function renderedMain(page: Page, route: string, heading?: string) {
  const response = await page.request.get(route);
  expect(response.status(), route).toBe(200);
  const serverHtml = await response.text();
  const serverMain = await page.evaluate(
    (html) =>
      new DOMParser().parseFromString(html, 'text/html').querySelector('main.cms-core')?.innerHTML,
    serverHtml,
  );
  expect(serverMain, `${route} SSR main`).toBeTruthy();
  const browser = await page.goto(route);
  expect(browser?.status(), route).toBe(200);
  if (heading) await expect(page.getByRole('heading', { level: 1, name: heading })).toBeVisible();
  await page.evaluate(
    () =>
      new Promise<void>((resolve) =>
        requestAnimationFrame(() => requestAnimationFrame(() => resolve())),
      ),
  );
  const hydratedMain = await page.locator('main.cms-core').innerHTML();
  expect(hydratedMain, `${route} hydration`).toBe(serverMain);
  return hydratedMain;
}

async function semanticMain(page: Page) {
  return page.locator('main').evaluate((element) => {
    const clone = element.cloneNode(true) as HTMLElement;
    clone
      .querySelectorAll('[data-block-id]')
      .forEach((block) => block.removeAttribute('data-block-id'));
    return clone.innerHTML;
  });
}

test('real EN/VI preview-public SSR, hydration and pixel pairs at 390/768/1440', async ({
  page,
}, testInfo: TestInfo) => {
  test.setTimeout(240_000);
  await signIn(page);
  const headers = { Origin: new URL(page.url()).origin };
  const created = await page.request.post('/api/admin/pages', {
    headers,
    data: { key, title: 'Parity matrix', locale: 'en', template: 'empty' },
  });
  expect(created.status(), await created.text()).toBe(201);
  const seo = await page.request.patch(`/api/admin/pages/${key}`, {
    headers,
    data: { seoTitleVi: 'Kiểm chứng tương đồng' },
  });
  expect(seo.status(), await seo.text()).toBe(200);
  const activated = await page.request.post(`/api/admin/pages/${key}/builder/activate`, {
    headers,
    data: { expectedRevision: '0', tree },
  });
  expect(activated.status(), await activated.text()).toBe(200);
  const saved = await page.request.put(`/api/admin/pages/${key}/builder/draft`, {
    headers,
    data: { expectedRevision: '1', tree },
  });
  expect(saved.status(), await saved.text()).toBe(200);
  expect((await saved.json()).tree.root.sections[0].content[0].responsive).toEqual(responsive);
  const published = await page.request.post(`/api/admin/pages/${key}/builder/publish`, {
    headers,
    data: { expectedRevision: '2' },
  });
  expect(published.status(), await published.text()).toBe(200);
  expect((await published.json()).publishedVersion).toBe(1);
  const version = await page.request.get(`/api/admin/pages/${key}/versions/1`);
  expect(version.status()).toBe(200);
  expect((await version.json()).snapshot.tree).toEqual(tree);

  for (const locale of ['en', 'vi'] as const) {
    const publicData = await page.request.get(`/api/public/pages/${key}?locale=${locale}`);
    const previewData = await page.request.get(
      `/api/admin/preview/pages/${key}?locale=${locale}&version=1`,
    );
    expect(publicData.status()).toBe(200);
    expect(previewData.status()).toBe(200);
    expect(await previewData.json()).toEqual({ ...(await publicData.json()), invalidBlocks: [] });
    for (const [width, expected] of [
      [390, 'Mobile'],
      [768, 'Tablet'],
      [1440, 'Desktop'],
    ] as const) {
      await page.setViewportSize({ width, height: 900 });
      const path = `/${locale}/${key}`;
      const publicMain = await renderedMain(page, path, `${expected} heading`);
      await expect(page.getByText(`${expected} copy`, { exact: true })).toBeVisible();
      const publicImage = await page
        .locator('main.cms-core')
        .screenshot({ animations: 'disabled' });
      await testInfo.attach(`${locale}-${width}-public.png`, {
        body: publicImage,
        contentType: 'image/png',
      });

      await page.goto(`/api/draft?path=${encodeURIComponent(path)}`);
      const previewMain = await renderedMain(page, `${path}?v=1`, `${expected} heading`);
      await expect(page.getByText(`${expected} copy`, { exact: true })).toBeVisible();
      expect(previewMain).toBe(publicMain);
      const previewImage = await page
        .locator('main.cms-core')
        .screenshot({ animations: 'disabled' });
      await testInfo.attach(`${locale}-${width}-preview.png`, {
        body: previewImage,
        contentType: 'image/png',
      });
      expect(
        previewImage.equals(publicImage),
        `${locale}/${width} preview/public pixel parity`,
      ).toBe(true);
      await page.goto(`/api/draft?exit=1&path=${encodeURIComponent(path)}`);
    }
  }
});

test('legacy UI publish, version history and restore preserve SSR/read version pairs', async ({
  page,
}) => {
  test.setTimeout(180_000);
  await signIn(page);
  const pageKey = 'd6-parity-history';
  const headers = { Origin: new URL(page.url()).origin };
  const created = await page.request.post('/api/admin/pages', {
    headers,
    data: { key: pageKey, title: 'Parity history', locale: 'en', template: 'starter' },
  });
  expect(created.status(), await created.text()).toBe(201);
  const initial = await created.json();
  const prose = initial.blocks.find((block: { type: string }) => block.type === 'prose');
  const path = `/en/${pageKey}`;

  for (const [copy, version] of [
    ['First version', 1],
    ['Second version', 2],
  ] as const) {
    const updated = await page.request.patch(`/api/admin/pages/${pageKey}/blocks/${prose.id}`, {
      headers,
      data: { props: { body: { en: copy, vi: '' } } },
    });
    expect(updated.status(), await updated.text()).toBe(200);
    await page.goto(`/admin/pages/${pageKey}`);
    await page.getByRole('button', { name: 'Publish', exact: true }).click();
    await expect(page.getByText(`Published v${version}`)).toBeVisible();
    const read = await page.request.get(`/api/admin/pages/${pageKey}/versions/${version}`);
    expect(read.status()).toBe(200);
    expect((await read.json()).snapshot.blocks).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ type: 'prose', props: { body: { en: copy, vi: '' } } }),
      ]),
    );
    await expect(async () => {
      await page.goto(path);
      await expect(page.getByText(copy, { exact: true })).toBeVisible();
    }).toPass({ timeout: 30_000 });
    const publicMain = await semanticMain(page);
    await page.goto(`/api/draft?path=${encodeURIComponent(path)}`);
    await page.goto(`${path}?v=${version}`);
    await expect(page.getByText(copy, { exact: true })).toBeVisible();
    expect(await semanticMain(page)).toBe(publicMain);
    await page.goto(`/api/draft?exit=1&path=${encodeURIComponent(path)}`);
  }

  await page.goto(`/admin/pages/${pageKey}`);
  await page.getByRole('button', { name: 'History' }).click();
  const history = page.getByRole('dialog');
  const first = history.getByRole('listitem').filter({ hasText: 'Version 1' });
  await first.getByRole('button', { name: 'Restore' }).click();
  await page.getByRole('alertdialog').getByRole('button', { name: 'Restore' }).click();
  await expect
    .poll(async () => {
      const response = await page.request.get(`/api/admin/pages/${pageKey}`);
      const result = await response.json();
      return result.blocks.find((block: { type: string }) => block.type === 'prose')?.props.body.en;
    })
    .toBe('First version');
  await page.keyboard.press('Escape');
  await page.getByRole('button', { name: 'Publish', exact: true }).click();
  await expect(page.getByText('Published v3')).toBeVisible();
  const restored = await page.request.get(`/api/admin/pages/${pageKey}/versions/3`);
  expect(restored.status()).toBe(200);
  expect((await restored.json()).snapshot.blocks).toEqual(
    expect.arrayContaining([
      expect.objectContaining({ type: 'prose', props: { body: { en: 'First version', vi: '' } } }),
    ]),
  );
  await expect(async () => {
    await page.goto(path);
    await expect(page.getByText('First version', { exact: true })).toBeVisible();
  }).toPass({ timeout: 30_000 });
});

test('all 20 host blocks have real published-preview EN/VI desktop visual and axe evidence', async ({
  page,
}, testInfo: TestInfo) => {
  test.setTimeout(10 * 60_000);
  await signIn(page);
  await page.setViewportSize({ width: 1440, height: 900 });
  const headers = { Origin: new URL(page.url()).origin };
  const definitions = Object.values(BLOCK_REGISTRY);
  expect(definitions).toHaveLength(20);
  const titleBlocks = definitions.filter((definition) => definition.role === 'h1');
  const otherBlocks = definitions.filter((definition) => definition.role !== 'h1');

  for (const [index, titleBlock] of titleBlocks.entries()) {
    const blocks = index === 0 ? [titleBlock, ...otherBlocks] : [titleBlock];
    const pageKey = `d6-visual-${titleBlock.type}`;
    const treeDocument = {
      schemaVersion: 1,
      root: {
        id: 'visual-page',
        type: 'page',
        responsive: { base: {} },
        sections: [
          {
            id: 'visual-section',
            type: 'section',
            responsive: { base: {} },
            content: blocks.map((definition) => ({
              id: `visual-${definition.type}`,
              type: 'component',
              componentType: definition.type,
              responsive: { base: definition.defaults },
            })),
          },
        ],
      },
    };
    const created = await page.request.post('/api/admin/pages', {
      headers,
      data: { key: pageKey, title: `Visual ${titleBlock.type}`, locale: 'en', template: 'empty' },
    });
    expect(created.status(), await created.text()).toBe(201);
    const activated = await page.request.post(`/api/admin/pages/${pageKey}/builder/activate`, {
      headers,
      data: { expectedRevision: '0', tree: treeDocument },
    });
    expect(activated.status(), await activated.text()).toBe(200);
    const published = await page.request.post(`/api/admin/pages/${pageKey}/builder/publish`, {
      headers,
      data: { expectedRevision: '1' },
    });
    expect(published.status(), await published.text()).toBe(200);

    for (const locale of ['en', 'vi'] as const) {
      const path = `/${locale}/${pageKey}`;
      const publicMain = await renderedMain(page, path);
      await expect(page.locator('main.cms-core')).toHaveCSS('color-scheme', 'light');
      const publicCaptures = new Map<string, Buffer>();
      for (const definition of blocks) {
        const locator = page.locator(`[data-host-block-type="${definition.type}"]`);
        await expect(locator).toHaveCount(1);
        const image = await locator.screenshot({ animations: 'disabled' });
        publicCaptures.set(definition.type, image);
        await testInfo.attach(`${locale}-host-default-light-1440-${definition.type}-public.png`, {
          body: image,
          contentType: 'image/png',
        });
      }
      const axe = await new AxeBuilder({ page })
        .include('main.cms-core')
        .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
        .analyze();
      await testInfo.attach(`${locale}-host-default-light-1440-${titleBlock.type}-axe.json`, {
        body: JSON.stringify(axe.violations),
        contentType: 'application/json',
      });
      expect(
        axe.violations.filter((violation) =>
          ['serious', 'critical'].includes(violation.impact ?? ''),
        ),
        `${titleBlock.type}/${locale}`,
      ).toEqual([]);

      await page.goto(`/api/draft?path=${encodeURIComponent(path)}`);
      const previewMain = await renderedMain(page, `${path}?v=1`);
      expect(previewMain).toBe(publicMain);
      const previewAxe = await new AxeBuilder({ page })
        .include('main.cms-core')
        .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
        .analyze();
      await testInfo.attach(
        `${locale}-host-default-light-1440-${titleBlock.type}-preview-axe.json`,
        {
          body: JSON.stringify(previewAxe.violations),
          contentType: 'application/json',
        },
      );
      expect(
        previewAxe.violations.map(({ id, nodes }) => ({
          id,
          targets: nodes.map(({ target }) => target),
        })),
      ).toEqual(
        axe.violations.map(({ id, nodes }) => ({ id, targets: nodes.map(({ target }) => target) })),
      );
      for (const definition of blocks) {
        const image = await page
          .locator(`[data-host-block-type="${definition.type}"]`)
          .screenshot({ animations: 'disabled' });
        await testInfo.attach(`${locale}-host-default-light-1440-${definition.type}-preview.png`, {
          body: image,
          contentType: 'image/png',
        });
        expect(image.equals(publicCaptures.get(definition.type)!)).toBe(true);
      }
      await page.goto(`/api/draft?exit=1&path=${encodeURIComponent(path)}`);
    }
  }
});
