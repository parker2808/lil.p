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
      const headingType = headings[group]!.type;
      const versionLabel = (version: number) =>
        locale === 'vi'
          ? `Phiên bản ${version} ${headingType}`
          : `Version ${version} ${headingType}`;
      const tree = {
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
                responsive: {
                  base: structuredClone(definition.defaults) as Record<string, unknown>,
                },
              })),
            },
          ],
        },
      };
      const setHeadingVersion = (version: number, target: typeof tree) => {
        const props = target.root.sections[0]!.content[0]!.responsive.base;
        const label = {
          en: `Version ${version} ${headingType}`,
          vi: `Phiên bản ${version} ${headingType}`,
        };
        if (headingType === 'hero') {
          (props.primaryCta as { label: typeof label }).label = label;
        } else {
          props.eyebrow = label;
          if (headingType === 'page-header') {
            props.title = { en: 'Case studies', vi: 'Dự án' };
          }
        }
      };
      setHeadingVersion(1, tree);
      const created = await page.request.post('/api/admin/pages', {
        headers,
        data: { key, title: 'No-script host coverage', locale: 'en', template: 'empty' },
      });
      expect(created.status(), await created.text()).toBe(201);
      const activated = await page.request.post(`/api/admin/pages/${key}/builder/activate`, {
        headers,
        data: {
          expectedRevision: '0',
          tree,
        },
      });
      expect(activated.status(), await activated.text()).toBe(200);
      const published = await page.request.post(`/api/admin/pages/${key}/builder/publish`, {
        headers,
        data: { expectedRevision: (await activated.json()).revision },
      });
      expect(published.status(), await published.text()).toBe(200);
      expect((await published.json()).publishedVersion).toBe(1);
      const secondTree = structuredClone(tree);
      setHeadingVersion(2, secondTree);
      const draftPath = `/api/admin/pages/${key}/builder/draft`;
      const draft = await page.request.get(draftPath);
      expect(draft.status(), await draft.text()).toBe(200);
      const updated = await page.request.put(draftPath, {
        headers,
        data: { expectedRevision: (await draft.json()).revision, tree: secondTree },
      });
      expect(updated.status(), await updated.text()).toBe(200);
      const secondPublish = await page.request.post(`/api/admin/pages/${key}/builder/publish`, {
        headers,
        data: { expectedRevision: (await updated.json()).revision },
      });
      expect(secondPublish.status(), await secondPublish.text()).toBe(200);
      expect((await secondPublish.json()).publishedVersion).toBe(2);
      const currentPublic = await page.request.get(`/api/public/pages/${key}?locale=${locale}`);
      const oldPreview = await page.request.get(
        `/api/admin/preview/pages/${key}?locale=${locale}&version=1`,
      );
      expect(currentPublic.status()).toBe(200);
      expect(oldPreview.status()).toBe(200);
      expect((await currentPublic.json()).tree).toEqual(secondTree);
      expect((await oldPreview.json()).tree).toEqual(tree);

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
            const requestedRoute = preview ? `${route}?v=1` : route;
            const response = await visitor.goto(new URL(requestedRoute, origin).href);
            expect(response?.status()).toBe(200);
            await expect(visitor.locator('html')).toHaveAttribute('lang', locale);
            const main = visitor.locator('#content > main.cms-core-host:visible');
            await expect(main).toHaveCount(1);
            await expect(main).toBeVisible();
            const wrappers = main.locator('[data-host-block-type]');
            await expect(wrappers).toHaveCount(5);
            const snapshot = await wrappers.evaluateAll((elements) =>
              elements.map((element) => {
                const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT);
                const painted: string[] = [];
                while (walker.nextNode()) {
                  const textNode = walker.currentNode;
                  const parent = textNode.parentElement;
                  if (
                    !textNode.textContent?.trim() ||
                    parent === element ||
                    !parent?.checkVisibility({ checkOpacity: true, checkVisibilityCSS: true })
                  )
                    continue;
                  const range = document.createRange();
                  range.selectNodeContents(textNode);
                  if (
                    Array.from(range.getClientRects()).some(
                      (rect) => rect.width > 0 && rect.height > 0,
                    )
                  ) {
                    painted.push(textNode.textContent ?? '');
                  }
                }
                return {
                  type: element.getAttribute('data-host-block-type'),
                  hash: element.getAttribute('data-host-props-hash'),
                  text: painted.join(' ').replace(/\s+/g, ' ').trim(),
                  childCount: element.children.length,
                };
              }),
            );
            expect(snapshot.map(({ type }) => type)).toEqual(blocks.map(({ type }) => type));
            expect(snapshot[0]?.text, `${locale}/${width} rendered version`).toContain(
              versionLabel(preview ? 1 : 2),
            );
            expect(snapshot[0]?.text).not.toContain(versionLabel(preview ? 2 : 1));
            for (const [index, block] of snapshot.entries()) {
              expect(block.hash, `${locale}/${width}/${block.type} SSR props`).toMatch(
                /^[a-f0-9]{64}$/,
              );
              if (block.type === 'cv-download') {
                expect(block.text, 'No configured resume is an explicit empty state').toBe('');
              } else {
                await expect(wrappers.nth(index)).toBeVisible();
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
              route: requestedRoute,
              version: preview ? 1 : 2,
              types: snapshot.map(({ type }) => type),
              screenshot: name,
              sha256: createHash('sha256').update(screenshot).digest('hex'),
            });
            snapshots.push(snapshot);
          } finally {
            await context.close();
          }
        }
        expect(snapshots[1]![0]!.hash, `${locale}/${width} historical props`).not.toBe(
          snapshots[0]![0]!.hash,
        );
        expect(snapshots[1]![0]!.text, `${locale}/${width} historical text`).not.toBe(
          snapshots[0]![0]!.text,
        );
        expect(snapshots[1]!.slice(1), `${locale}/${width} unchanged host semantics`).toEqual(
          snapshots[0]!.slice(1),
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
