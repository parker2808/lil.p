import { createHash } from 'node:crypto';

import AxeBuilder from '@axe-core/playwright';
import { BLOCK_REGISTRY } from '@portfolio/contracts';
import { expect, test } from '@playwright/test';

import { signIn } from './auth';
import { imageDifference } from './d6-visual-matrix';

export const widths = [390, 768, 1440] as const;
const locales = ['en', 'vi'] as const;
const themes = ['light', 'dark'] as const;
const brands = ['neutral', 'lilp'] as const;
const modes = ['public', 'preview'] as const;

function normalizeSuspenseTemplateIds(markup: string) {
  const templateIds = new Map<string, number>();
  return markup.replace(
    /(<template id="B:)(\d+)(")/g,
    (_, prefix: string, id: string, suffix: string) => {
      if (!templateIds.has(id)) templateIds.set(id, templateIds.size);
      return `${prefix}${templateIds.get(id)}${suffix}`;
    },
  );
}

function hostPalette(element: Element) {
  const styles = getComputedStyle(element);
  return {
    color: styles.color,
    background: styles.backgroundColor,
    colorScheme: styles.colorScheme,
    primary: styles.getPropertyValue('--primary').trim(),
    primaryForeground: styles.getPropertyValue('--primary-foreground').trim(),
    subtleForeground: styles.getPropertyValue('--subtle-foreground').trim(),
    builderAccent: styles.getPropertyValue('--builder-accent').trim(),
    builderAccentText: styles.getPropertyValue('--builder-accent-text').trim(),
  };
}

function treeFor(group: number, locale: 'en' | 'vi') {
  const definitions = Object.values(BLOCK_REGISTRY);
  const headings = definitions.filter((definition) => definition.role === 'h1');
  const others = definitions.filter((definition) => definition.role !== 'h1');
  expect(definitions).toHaveLength(20);
  expect(headings).toHaveLength(4);
  const blocks = [headings[group]!, ...others.slice(group * 4, group * 4 + 4)];
  expect(blocks).toHaveLength(5);
  const localizedLabel = { en: 'Gallery example', vi: 'Ví dụ thư viện' };
  const headingProps = structuredClone(headings[group]!.defaults) as Record<string, unknown>;
  if (headings[group]!.type === 'hero') {
    headingProps.primaryCta = { label: localizedLabel, href: '/projects' };
  } else if (headings[group]!.type === 'about-intro') {
    headingProps.eyebrow = localizedLabel;
  } else {
    headingProps.eyebrow = { en: 'Gallery', vi: 'Thư viện' };
    headingProps.title = localizedLabel;
  }
  return {
    blocks,
    headingLabel: localizedLabel[locale],
    tree: {
      schemaVersion: 1,
      root: {
        id: `all20-root-${group}`,
        type: 'page',
        responsive: { base: {} },
        sections: [
          {
            id: `all20-section-${group}`,
            type: 'section',
            responsive: { base: {} },
            content: blocks.map((definition, index) => ({
              id: `all20-${definition.type}`,
              type: 'component',
              componentType: definition.type,
              responsive: {
                base: index === 0 ? headingProps : structuredClone(definition.defaults),
              },
            })),
          },
        ],
      },
    },
  };
}

export function registerAll20SsrMatrix(group: number, width: (typeof widths)[number]) {
  for (const locale of locales) {
    for (const theme of themes) {
      test(`all-20 real-host SSR group ${group} ${locale} ${theme} ${width}px`, async ({
        page,
        browser,
        baseURL,
      }, testInfo) => {
        test.setTimeout(120_000);
        await signIn(page);
        const { blocks, tree, headingLabel } = treeFor(group, locale);
        const key = `all20-ssr-${group}-${locale}-${theme}-${width}-${Date.now()}-${testInfo.retry}`;
        const origin = new URL(baseURL!);
        const neutral = new URL(baseURL!);
        neutral.hostname = 'neutral.localhost';
        const route = `/${locale}/${key}`;
        const headers = { Origin: origin.origin };
        const savedProfile = blocks.some(({ type }) => type === 'cv-download')
          ? await page.request.get('/api/admin/profile')
          : null;
        let uploadedMediaId: number | undefined;
        try {
          if (savedProfile) {
            expect(savedProfile.status()).toBe(200);
            const uploaded = await page.request.post('/api/admin/media', {
              headers,
              multipart: {
                file: {
                  name: 'e2e-resume.pdf',
                  mimeType: 'application/pdf',
                  buffer: Buffer.from('%PDF-1.4\n1 0 obj<</Type/Catalog>>endobj\n%%EOF\n'),
                },
              },
            });
            expect(uploaded.status(), await uploaded.text()).toBe(201);
            uploadedMediaId = (await uploaded.json()).id as number;
            const updated = await page.request.patch('/api/admin/profile', {
              headers,
              data: { resumeEnId: uploadedMediaId, resumeViId: uploadedMediaId },
            });
            expect(updated.status(), await updated.text()).toBe(200);
          }
          const created = await page.request.post('/api/admin/pages', {
            headers,
            data: { key, title: `All-20 SSR ${group}`, locale, template: 'empty' },
          });
          expect(created.status(), await created.text()).toBe(201);
          const activated = await page.request.post(`/api/admin/pages/${key}/builder/activate`, {
            headers,
            data: { expectedRevision: '0', tree },
          });
          expect(activated.status(), await activated.text()).toBe(200);
          const published = await page.request.post(`/api/admin/pages/${key}/builder/publish`, {
            headers,
            data: { expectedRevision: (await activated.json()).revision },
          });
          expect(published.status(), await published.text()).toBe(200);
          expect((await published.json()).publishedVersion).toBe(1);

          const manifest = [];
          for (const brand of brands) {
            const host = brand === 'neutral' ? neutral : origin;
            const cookies = (await page.context().cookies()).map((cookie) => ({
              ...cookie,
              domain: host.hostname,
            }));
            const context = await browser.newContext({
              javaScriptEnabled: false,
              colorScheme: theme,
              viewport: { width, height: 900 },
              storageState: { cookies, origins: [] },
            });
            const axeContext = await browser.newContext({
              colorScheme: theme,
              viewport: { width, height: 900 },
              storageState: { cookies, origins: [] },
            });
            try {
              const visitor = await context.newPage();
              const axePage = await axeContext.newPage();
              const axeSession = await axeContext.newCDPSession(axePage);
              await axeSession.send('Emulation.setScriptExecutionDisabled', { value: true });
              const publicImages = new Map<string, Buffer>();
              const publicHashes = new Map<string, string>();
              const publicText = new Map<string, string>();
              for (const mode of modes) {
                const label = `${locale}-${theme}-${brand}-${width}-group${group}-${mode}`;
                console.log(`[all20-ssr] ${label}: navigate`);
                if (mode === 'preview') {
                  const enabled = await visitor.goto(
                    new URL(`/api/draft?path=${encodeURIComponent(route)}`, host).href,
                  );
                  expect(enabled?.url()).toContain(route);
                }
                const url = new URL(mode === 'preview' ? `${route}?v=1` : route, host);
                const response = await visitor.goto(url.href);
                expect(response?.status(), url.href).toBe(200);
                expect(await response!.text()).toContain(`data-brand="${brand}"`);
                await expect(visitor.locator('html')).toHaveAttribute('lang', locale);
                const main = visitor.locator('#content > main.cms-core-host:visible');
                await expect(main).toHaveCount(1);
                const ssrMarkup = await main.evaluate((element) => element.outerHTML);
                await expect(main).toHaveAttribute('data-brand', brand);
                await expect(main).toHaveCSS('color-scheme', theme);
                const accent = await main.evaluate((element) =>
                  getComputedStyle(element).getPropertyValue('--builder-accent').trim(),
                );
                expect(accent, `${locale}/${theme}/${brand}/${width} server-selected palette`).toBe(
                  brand === 'neutral'
                    ? theme === 'dark'
                      ? '#98b8ff'
                      : '#255cce'
                    : theme === 'dark'
                      ? '#ffb587'
                      : '#a44520',
                );
                const wrappers = main.locator('[data-host-block-type]');
                await expect(wrappers).toHaveCount(5);
                await expect(wrappers.first()).toContainText(headingLabel);
                const snapshot = await wrappers.evaluateAll((elements) =>
                  elements.map((element) => {
                    const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT);
                    const painted: string[] = [];
                    while (walker.nextNode()) {
                      const node = walker.currentNode;
                      const parent = node.parentElement;
                      const text = node.textContent?.trim();
                      if (
                        !text ||
                        !parent?.checkVisibility({ checkOpacity: true, checkVisibilityCSS: true })
                      )
                        continue;
                      const range = document.createRange();
                      range.selectNodeContents(node);
                      if (
                        Array.from(range.getClientRects()).some(
                          (rect) => rect.width > 0 && rect.height > 0,
                        )
                      ) {
                        painted.push(text);
                      }
                    }
                    return {
                      type: element.getAttribute('data-host-block-type'),
                      hash: element.getAttribute('data-host-props-hash'),
                      text: painted.join(' ').replace(/\s+/g, ' ').trim(),
                      visible: element.checkVisibility({
                        checkOpacity: true,
                        checkVisibilityCSS: true,
                      }),
                    };
                  }),
                );
                expect(snapshot.map(({ type }) => type)).toEqual(blocks.map(({ type }) => type));
                for (const block of snapshot) {
                  expect(block.hash, `${url.href}/${block.type} SSR props`).toMatch(
                    /^[a-f0-9]{64}$/,
                  );
                  expect(block.visible, `${url.href}/${block.type} visible without JS`).toBe(true);
                  expect(
                    block.text,
                    `${url.href}/${block.type} painted content without JS`,
                  ).not.toBe('');
                  if (mode === 'preview') {
                    expect(block.hash, `${url.href}/${block.type} same published version`).toBe(
                      publicHashes.get(block.type!),
                    );
                    expect(block.text, `${url.href}/${block.type} same painted content`).toBe(
                      publicText.get(block.type!),
                    );
                  } else {
                    publicHashes.set(block.type!, block.hash!);
                    publicText.set(block.type!, block.text);
                  }
                }
                const banner = visitor.locator('[data-slot="draft-banner"]');
                if (mode === 'preview') await expect(banner).toBeVisible();
                else await expect(banner).toHaveCount(0);
                console.log(`[all20-ssr] ${label}: fonts-start`);
                await expect
                  .poll(() => visitor.evaluate(() => document.fonts.status), { timeout: 5_000 })
                  .toBe('loaded');
                console.log(`[all20-ssr] ${label}: fonts-loaded`);
                const session = await context.newCDPSession(visitor);
                console.log(`[all20-ssr] ${label}: cdp-attached`);
                const { cssContentSize } = await session.send('Page.getLayoutMetrics');
                console.log(
                  `[all20-ssr] ${label}: layout ${cssContentSize.width}x${cssContentSize.height}`,
                );
                expect(cssContentSize.width, `${label} full-page width`).toBeGreaterThanOrEqual(
                  width,
                );
                expect(cssContentSize.height, `${label} full-page height`).toBeGreaterThanOrEqual(
                  900,
                );
                expect(cssContentSize.height, `${label} bounded full-page height`).toBeLessThan(
                  20_000,
                );
                console.log(`[all20-ssr] ${label}: cdp-capture-start`);
                const { data } = await session.send('Page.captureScreenshot', {
                  format: 'png',
                  captureBeyondViewport: true,
                  fromSurface: true,
                  clip: {
                    x: 0,
                    y: 0,
                    width: Math.ceil(cssContentSize.width),
                    height: Math.ceil(cssContentSize.height),
                    scale: 1,
                  },
                });
                console.log(`[all20-ssr] ${label}: cdp-capture-complete`);
                const fullImage = Buffer.from(data, 'base64');
                expect(fullImage.readUInt32BE(16), `${label} PNG width`).toBe(
                  Math.ceil(cssContentSize.width),
                );
                expect(fullImage.readUInt32BE(20), `${label} PNG height`).toBe(
                  Math.ceil(cssContentSize.height),
                );
                await testInfo.attach(`${label}-page.png`, {
                  body: fullImage,
                  contentType: 'image/png',
                });
                console.log(`[all20-ssr] ${label}: page-attached`);
                const screenshots = [];
                for (const block of blocks) {
                  console.log(`[all20-ssr] ${label}: crop-start ${block.type}`);
                  const image = await main
                    .locator(`[data-host-block-type="${block.type}"]`)
                    .screenshot({
                      animations: 'disabled',
                      style:
                        '[data-slot="draft-banner"], .site-header, .locale-toast, .hero-stage canvas { visibility: hidden !important; }',
                    });
                  console.log(`[all20-ssr] ${label}: crop-complete ${block.type}`);
                  const name = `${label}-${block.type}.png`;
                  await testInfo.attach(name, { body: image, contentType: 'image/png' });
                  screenshots.push({
                    name,
                    type: block.type,
                    sha256: createHash('sha256').update(image).digest('hex'),
                  });
                  if (mode === 'preview') {
                    const difference = await imageDifference(
                      visitor,
                      publicImages.get(block.type)!,
                      image,
                    );
                    expect(
                      difference.differingPixels / difference.totalPixels,
                      `${label}/${block.type} no-script public/preview pixels`,
                    ).toBeLessThanOrEqual(0.005);
                  } else {
                    publicImages.set(block.type, image);
                  }
                }
                console.log(`[all20-ssr] ${label}: axe-start`);
                const ssrPalette = await main.evaluate(hostPalette);
                const ssrButtons = await main.locator('.redesign-button').evaluateAll((elements) =>
                  elements.map((element) => ({
                    color: getComputedStyle(element).color,
                    background: getComputedStyle(element).backgroundColor,
                  })),
                );
                await axeContext.addCookies(await context.cookies());
                const axeResponse = await axePage.goto(url.href);
                expect(axeResponse?.status(), `${label} axe SSR response`).toBe(200);
                const axeMain = axePage.locator('#content > main.cms-core-host:visible');
                await expect(axeMain).toHaveCount(1);
                expect(
                  normalizeSuspenseTemplateIds(
                    await axeMain.evaluate((element) => element.outerHTML),
                  ),
                  `${label} identical unhydrated SSR main except request-local Suspense template IDs`,
                ).toBe(normalizeSuspenseTemplateIds(ssrMarkup));
                await axePage.evaluate((dark) => {
                  document.documentElement.classList.toggle('dark', dark);
                }, theme === 'dark');
                expect(
                  await axeMain.evaluate(hostPalette),
                  `${label} identical no-script host palette`,
                ).toEqual(ssrPalette);
                await axeSession.send('Emulation.setScriptExecutionDisabled', { value: false });
                await expect
                  .poll(
                    () =>
                      axeMain
                        .locator('.redesign-button')
                        .evaluateAll((elements) =>
                          elements.reduce(
                            (count, element) =>
                              count +
                              element
                                .getAnimations({ subtree: true })
                                .filter((animation) => animation.playState === 'running').length,
                            0,
                          ),
                        ),
                    { timeout: 5_000 },
                  )
                  .toBe(0);
                expect(
                  await axeMain.evaluate(hostPalette),
                  `${label} stable axe host palette`,
                ).toEqual(ssrPalette);
                expect(
                  await axeMain.locator('.redesign-button').evaluateAll((elements) =>
                    elements.map((element) => ({
                      color: getComputedStyle(element).color,
                      background: getComputedStyle(element).backgroundColor,
                    })),
                  ),
                  `${label} same painted CTA colors as no-script visitor`,
                ).toEqual(ssrButtons);
                const axe = await new AxeBuilder({ page: axePage })
                  .include('#content > main.cms-core-host')
                  .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
                  .analyze();
                await axeSession.send('Emulation.setScriptExecutionDisabled', { value: true });
                await testInfo.attach(`${label}-axe.json`, {
                  body: JSON.stringify(axe.violations),
                  contentType: 'application/json',
                });
                expect(axe.violations, `${label} unwaived WCAG AA`).toEqual([]);
                console.log(`[all20-ssr] ${label}: complete`);
                manifest.push({
                  label,
                  url: url.pathname + url.search,
                  blocks: snapshot,
                  accent,
                  screenshots,
                  fullImageSha256: createHash('sha256').update(fullImage).digest('hex'),
                  axeViolations: axe.violations.length,
                });
              }
            } finally {
              await axeContext.close();
              await context.close();
            }
          }
          expect(manifest).toHaveLength(4);
          await testInfo.attach(`${locale}-${theme}-${width}-group${group}-manifest.json`, {
            body: JSON.stringify({
              sourceHead: process.env.E2E_SOURCE_HEAD_SHA ?? null,
              testedMerge: process.env.GITHUB_SHA ?? null,
              runId: process.env.GITHUB_RUN_ID ?? null,
              key,
              types: blocks.map(({ type }) => type),
              tuples: manifest,
            }),
            contentType: 'application/json',
          });
        } finally {
          if (savedProfile) {
            const profile = await savedProfile.json();
            const restored = await page.request.patch('/api/admin/profile', {
              headers,
              data: { resumeEnId: profile.resumeEnId, resumeViId: profile.resumeViId },
            });
            expect(restored.status(), await restored.text()).toBe(200);
            if (uploadedMediaId) {
              const deleted = await page.request.delete(`/api/admin/media/${uploadedMediaId}`, {
                headers,
              });
              expect(deleted.status()).toBe(204);
            }
          }
        }
      });
    }
  }
}
