import { createHash } from 'node:crypto';

import { BLOCK_REGISTRY } from '@portfolio/contracts';
import { expect, test } from '@playwright/test';

import { signIn } from './helpers/auth';

const widths = [390, 768, 1440] as const;

for (const group of [0, 1, 2, 3]) {
  for (const locale of ['en', 'vi'] as const) {
    test(`all-20 host group ${group} ${locale} no-script public/preview at three widths`, async ({
      page,
      browser,
      baseURL,
    }, testInfo) => {
      test.setTimeout(180_000);
      await signIn(page);
      const definitions = Object.values(BLOCK_REGISTRY);
      const headings = definitions.filter((definition) => definition.role === 'h1');
      const others = definitions.filter((definition) => definition.role !== 'h1');
      expect(definitions).toHaveLength(20);
      expect(headings).toHaveLength(4);
      const blocks = [headings[group]!, ...others.slice(group * 4, group * 4 + 4)];
      expect(blocks).toHaveLength(5);
      const key = `d6-nojs-${group}-${locale}-${Date.now()}-${testInfo.retry}`;
      const route = `/${locale}/${key}`;
      const headers = { Origin: new URL(page.url()).origin };
      const created = await page.request.post('/api/admin/pages', {
        headers,
        data: { key, title: 'No-script host coverage', locale: 'en', template: 'empty' },
      });
      expect(created.status(), await created.text()).toBe(201);
      const activated = await page.request.post(`/api/admin/pages/${key}/builder/activate`, {
        headers,
        data: {
          expectedRevision: '0',
          tree: {
            schemaVersion: 1,
            root: {
              id: 'nojs-page',
              type: 'page',
              responsive: { base: {} },
              sections: [
                {
                  id: 'nojs-section',
                  type: 'section',
                  responsive: { base: {} },
                  content: blocks.map((definition) => ({
                    id: `nojs-${definition.type}`,
                    type: 'component',
                    componentType: definition.type,
                    responsive: { base: definition.defaults },
                  })),
                },
              ],
            },
          },
        },
      });
      expect(activated.status(), await activated.text()).toBe(200);
      const published = await page.request.post(`/api/admin/pages/${key}/builder/publish`, {
        headers,
        data: { expectedRevision: (await activated.json()).revision },
      });
      expect(published.status(), await published.text()).toBe(200);

      const origin = new URL(baseURL!);
      const cookies = await page.context().cookies();
      const manifest = [];
      for (const width of widths) {
        const snapshots = [];
        for (const preview of [false, true]) {
          const context = await browser.newContext({
            javaScriptEnabled: false,
            viewport: { width, height: 900 },
            storageState: { cookies, origins: [] },
          });
          try {
            const visitor = await context.newPage();
            if (preview) {
              const enabled = await visitor.goto(
                new URL(`/api/draft?path=${encodeURIComponent(route)}`, origin).href,
              );
              expect(enabled?.url()).toContain(route);
            }
            const response = await visitor.goto(new URL(route, origin).href);
            expect(response?.status()).toBe(200);
            await expect(visitor.locator('html')).toHaveAttribute('lang', locale);
            const main = visitor.locator('#content > main.cms-core-host');
            await expect(main).toHaveCount(1);
            const wrappers = main.locator('[data-host-block-type]');
            await expect(wrappers).toHaveCount(5);
            const snapshot = await wrappers.evaluateAll((elements) =>
              elements.map((element) => ({
                type: element.getAttribute('data-host-block-type'),
                hash: element.getAttribute('data-host-props-hash'),
                text: element.textContent?.replace(/\s+/g, ' ').trim() ?? '',
                childCount: element.children.length,
              })),
            );
            expect(snapshot.map(({ type }) => type)).toEqual(blocks.map(({ type }) => type));
            for (const block of snapshot) {
              expect(block.hash, `${locale}/${width}/${block.type} SSR props`).toMatch(
                /^[a-f0-9]{64}$/,
              );
              if (block.type === 'cv-download') {
                expect(block.text, 'No configured resume is an explicit empty state').toBe('');
              } else {
                expect(block.text, `${locale}/${width}/${block.type} no-script content`).not.toBe(
                  '',
                );
                expect(
                  block.childCount,
                  `${locale}/${width}/${block.type} nested SSR`,
                ).toBeGreaterThan(0);
              }
            }
            const overflow = await visitor.evaluate(() => ({
              documentWidth: document.documentElement.scrollWidth,
              viewportWidth: window.innerWidth,
            }));
            expect(
              overflow.documentWidth,
              `${locale}/${width} horizontal overflow`,
            ).toBeLessThanOrEqual(overflow.viewportWidth + 1);
            const banner = visitor.locator('[data-slot="draft-banner"]');
            if (preview) await expect(banner).toBeVisible();
            else await expect(banner).toHaveCount(0);
            const screenshot = await visitor.screenshot({ fullPage: true, animations: 'disabled' });
            const name = `${locale}-${width}-group${group}-${preview ? 'preview' : 'public'}.png`;
            await testInfo.attach(name, { body: screenshot, contentType: 'image/png' });
            manifest.push({
              width,
              preview,
              route,
              types: snapshot.map(({ type }) => type),
              screenshot: name,
              sha256: createHash('sha256').update(screenshot).digest('hex'),
            });
            snapshots.push(snapshot);
          } finally {
            await context.close();
          }
        }
        expect(snapshots[1], `${locale}/${width} no-script preview/public semantics`).toEqual(
          snapshots[0],
        );
      }
      expect(manifest).toHaveLength(6);
      await testInfo.attach(`${locale}-group${group}-nojs-manifest.json`, {
        body: JSON.stringify({
          sourceHead: process.env.E2E_SOURCE_HEAD_SHA ?? process.env.GITHUB_SHA ?? null,
          testedMerge: process.env.GITHUB_SHA ?? null,
          runId: process.env.GITHUB_RUN_ID ?? null,
          pageKey: key,
          tuples: manifest,
        }),
        contentType: 'application/json',
      });
    });
  }
}
