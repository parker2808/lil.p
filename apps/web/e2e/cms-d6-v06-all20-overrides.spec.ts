import { createHash } from 'node:crypto';

import { BLOCK_REGISTRY, HOST_TREE_REGISTRY, resolveBlockLocale } from '@portfolio/contracts';
import { readTree, resolveResponsive } from '@parker2808/cms-core/tree';
import { expect, test } from '@playwright/test';

import { signIn } from './helpers/auth';

const breakpoints = [
  { width: 390, name: 'mobile', columns: 2 },
  { width: 768, name: 'tablet', columns: 3 },
  { width: 1440, name: 'desktop', columns: 4 },
] as const;

function label(locale: 'en' | 'vi', version: number, breakpoint: string, type: string) {
  return locale === 'vi'
    ? `Phiên bản ${version} ${breakpoint} ${type}`
    : `Version ${version} ${breakpoint} ${type}`;
}

function bilingual(version: number, breakpoint: string, type: string) {
  return {
    en: label('en', version, breakpoint, type),
    vi: label('vi', version, breakpoint, type),
  };
}

function fillBilingualDefaults(value: unknown): void {
  if (!value || typeof value !== 'object') return;
  if (Array.isArray(value)) {
    value.forEach(fillBilingualDefaults);
    return;
  }
  const record = value as Record<string, unknown>;
  if (typeof record.en === 'string' && record.vi === '') record.vi = record.en;
  Object.values(record).forEach(fillBilingualDefaults);
}

function host(type: string, version: number) {
  const definition = BLOCK_REGISTRY[type as keyof typeof BLOCK_REGISTRY];
  const base = structuredClone(definition.defaults) as Record<string, unknown>;
  fillBilingualDefaults(base);
  const variant = (breakpoint: string) => {
    if (type === 'hero')
      return { primaryCta: { label: bilingual(version, breakpoint, type), href: '/projects' } };
    if (type === 'about-intro') return { eyebrow: bilingual(version, breakpoint, type) };
    if (type === 'page-header' || type === 'contact-form' || type === 'cta-band') {
      return { title: bilingual(version, breakpoint, type) };
    }
    if (type === 'notes-browser' || type === 'projects-browser') {
      return {
        pageSize: (breakpoint === 'mobile' ? 4 : breakpoint === 'tablet' ? 5 : 6) + version,
      };
    }
    return { heading: { title: bilingual(version, breakpoint, type) } };
  };
  return {
    id: `host-${type}`,
    type: 'component',
    componentType: type,
    responsive: {
      base,
      mobile: variant('mobile'),
      tablet: variant('tablet'),
      desktop: variant('desktop'),
    },
  };
}

function tree(types: string[], version: number, locale: 'en' | 'vi') {
  const content = types.map((type) => host(type, version));
  return {
    schemaVersion: 1,
    root: {
      id: 'v06-root',
      type: 'page',
      responsive: { base: {} },
      sections: [
        {
          id: 'v06-section',
          type: 'section',
          responsive: { base: {} },
          content: [
            content[0],
            {
              id: 'v06-row',
              type: 'row',
              responsive: { base: {} },
              columns: [
                {
                  id: 'v06-column-one',
                  type: 'column',
                  responsive: {
                    base: { span: 1 },
                    mobile: { span: 1 },
                    tablet: { span: 2 },
                    desktop: { span: 2 },
                  },
                  content: content.slice(1, 3),
                },
                {
                  id: 'v06-column-two',
                  type: 'column',
                  responsive: { base: { span: 1 }, tablet: { span: 1 }, desktop: { span: 1 } },
                  content: content.slice(3),
                },
              ],
            },
            {
              id: 'v06-grid',
              type: 'grid',
              responsive: {
                base: { columns: 2 },
                mobile: { columns: 2 },
                tablet: { columns: 3 },
                desktop: { columns: 4 },
              },
              items: [0, 1].map((index) => ({
                id: `v06-copy-${index}`,
                type: 'component',
                componentType: 'paragraph',
                responsive: {
                  base: { text: label(locale, version, 'base', `nested-${index}`) },
                  mobile: { text: label(locale, version, 'mobile', `nested-${index}`) },
                  tablet: { text: label(locale, version, 'tablet', `nested-${index}`) },
                  desktop: { text: label(locale, version, 'desktop', `nested-${index}`) },
                },
              })),
            },
          ],
        },
      ],
    },
  };
}

for (const group of [0, 1, 2, 3]) {
  for (const locale of ['en', 'vi'] as const) {
    test(`V06 group ${group} ${locale}: all host overrides in no-JS public and historical preview`, async ({
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
      const types = [
        headings[group]!.type,
        ...others.slice(group * 4, group * 4 + 4).map((item) => item.type),
      ];
      expect(types).toHaveLength(5);
      const key = `v06-${group}-${locale}-${Date.now()}-${testInfo.retry}`;
      const route = `/${locale}/${key}`;
      const origin = new URL(baseURL!);
      const headers = { Origin: origin.origin };
      const first = tree(types, 1, locale);
      const second = tree(types, 2, locale);
      const created = await page.request.post('/api/admin/pages', {
        headers,
        data: { key, title: 'V06 override gate', locale, template: 'empty' },
      });
      expect(created.status(), await created.text()).toBe(201);
      const activated = await page.request.post(`/api/admin/pages/${key}/builder/activate`, {
        headers,
        data: { expectedRevision: '0', tree: first },
      });
      expect(activated.status(), await activated.text()).toBe(200);
      const firstPublish = await page.request.post(`/api/admin/pages/${key}/builder/publish`, {
        headers,
        data: { expectedRevision: (await activated.json()).revision },
      });
      expect(firstPublish.status(), await firstPublish.text()).toBe(200);
      expect((await firstPublish.json()).publishedVersion).toBe(1);
      const draftPath = `/api/admin/pages/${key}/builder/draft`;
      const draftRead = await page.request.get(draftPath);
      expect(draftRead.status(), await draftRead.text()).toBe(200);
      const saved = await page.request.put(draftPath, {
        headers,
        data: {
          expectedRevision: (await draftRead.json()).revision,
          tree: second,
        },
      });
      expect(saved.status(), await saved.text()).toBe(200);
      const secondPublish = await page.request.post(`/api/admin/pages/${key}/builder/publish`, {
        headers,
        data: { expectedRevision: (await saved.json()).revision },
      });
      expect(secondPublish.status(), await secondPublish.text()).toBe(200);
      expect((await secondPublish.json()).publishedVersion).toBe(2);
      const publicData = await page.request.get(`/api/public/pages/${key}?locale=${locale}`);
      const previewData = await page.request.get(
        `/api/admin/preview/pages/${key}?locale=${locale}&version=1`,
      );
      expect(publicData.status()).toBe(200);
      expect(previewData.status()).toBe(200);
      const publicTree = (await publicData.json()).tree;
      const previewTree = (await previewData.json()).tree;
      expect(publicTree).toEqual(second);
      expect(previewTree).toEqual(first);

      const cookies = await page.context().cookies();
      const captures = [];
      for (const { width, name, columns } of breakpoints) {
        for (const preview of [false, true]) {
          const context = await browser.newContext({
            javaScriptEnabled: false,
            viewport: { width, height: 900 },
            storageState: { cookies, origins: [] },
          });
          try {
            const visitor = await context.newPage();
            const parsed = readTree(preview ? previewTree : publicTree, HOST_TREE_REGISTRY);
            expect(parsed.ok).toBe(true);
            if (!parsed.ok) throw new Error(`Invalid persisted tree: ${parsed.code}`);
            const nodes = parsed.value.root.sections[0]!.content.flatMap((node) =>
              node.type === 'row'
                ? node.columns.flatMap((column) => column.content)
                : node.type === 'component'
                  ? [node]
                  : [],
            );
            if (preview) {
              const enabled = await visitor.goto(
                new URL(`/api/draft?path=${encodeURIComponent(route)}`, origin).href,
              );
              expect(enabled?.url()).toContain(route);
            }
            const path = preview ? `${route}?v=1` : route;
            const response = await visitor.goto(new URL(path, origin).href);
            expect(response?.status()).toBe(200);
            const html = await response!.text();
            await expect(visitor.locator('html')).toHaveAttribute('lang', locale);
            const main = visitor.locator('#content > main.cms-core-host:visible');
            await expect(main).toHaveCount(1);
            for (const type of types) {
              const hostNode = nodes.find((node) => node.id === `host-${type}`);
              expect(hostNode?.type).toBe('component');
              if (!hostNode || hostNode.type !== 'component')
                throw new Error(`Missing persisted host ${type}`);
              const effective = resolveResponsive(hostNode.responsive, name);
              const localized = resolveBlockLocale(effective, locale);
              const hash = createHash('sha256')
                .update(JSON.stringify({ props: localized.props, lang: localized.lang }))
                .digest('hex');
              expect(html, `${type}/${locale}/${width} SSR`).toContain(
                `data-host-props-hash="${hash}"`,
              );
              const active = await main
                .locator(`[data-node-id="host-${type}"] [data-host-block-type="${type}"]`)
                .evaluateAll((elements) =>
                  elements
                    .filter((element) => {
                      const variant = element.closest('.cms-tree__variant');
                      return !variant || getComputedStyle(variant).display !== 'none';
                    })
                    .map((element) => ({
                      hash: element.getAttribute('data-host-props-hash'),
                      text: element.textContent?.trim() ?? '',
                    })),
                );
              expect(active, `${type}/${locale}/${width} computed breakpoint`).toHaveLength(1);
              expect(active[0]?.hash).toBe(hash);
              if (type !== 'cv-download') {
                expect(active[0]?.text, `${type}/${locale}/${width} rendered content`).not.toBe('');
              }
            }
            const nested = label(locale, preview ? 1 : 2, name, 'nested-0');
            await expect(main.getByText(nested, { exact: true })).toBeVisible();
            await expect(
              main.getByText(label(locale, preview ? 2 : 1, name, 'nested-0'), { exact: true }),
            ).toHaveCount(0);
            const grid = await main
              .locator('[data-node-id="v06-grid"]')
              .evaluate(
                (element) => getComputedStyle(element).gridTemplateColumns.split(' ').length,
              );
            expect(grid, `${locale}/${width} grid columns`).toBe(columns);
            const row = await main
              .locator('[data-node-id="v06-row"]')
              .evaluate((element) =>
                getComputedStyle(element).gridTemplateColumns.split(' ').map(Number.parseFloat),
              );
            expect(row, `${locale}/${width} row tracks`).toHaveLength(2);
            const ratio = row[0]! / row[1]!;
            expect(ratio, `${locale}/${width} row track ratio`).toBeGreaterThan(
              name === 'mobile' ? 0.95 : 1.9,
            );
            expect(ratio, `${locale}/${width} row track ratio`).toBeLessThan(
              name === 'mobile' ? 1.05 : 2.1,
            );
            const nestedLayout = await main
              .locator(
                '.cms-tree__column .block-heading, .cms-tree__column [data-slot="process-flow"]',
              )
              .evaluateAll((elements) =>
                elements
                  .filter((element) => element.getClientRects().length > 0)
                  .map((element) => ({
                    kind: element.classList.contains('block-heading') ? 'heading' : 'process',
                    tracks: getComputedStyle(element).gridTemplateColumns.split(' ').length,
                    direction: getComputedStyle(element).flexDirection,
                    textWidth: element.lastElementChild?.getBoundingClientRect().width ?? 0,
                    width: element.getBoundingClientRect().width,
                  })),
              );
            expect(nestedLayout.some((layout) => layout.kind === 'heading')).toBe(true);
            for (const layout of nestedLayout) {
              if (layout.kind === 'heading') {
                expect(layout.tracks, `${locale}/${width} narrow heading`).toBe(1);
                expect(layout.textWidth, `${locale}/${width} heading text space`).toBeGreaterThan(
                  layout.width * 0.75,
                );
              } else {
                expect(layout.direction, `${locale}/${width} narrow process steps`).toBe('column');
              }
            }
            if (locale === 'en' && group === 0 && width === 768) {
              const statLayout = await main
                .locator('.cms-tree__column [data-slot="stat-band"]')
                .evaluateAll((bands) =>
                  bands.map((band) => ({
                    tracks: getComputedStyle(band).gridTemplateColumns.split(' ').length,
                    labels: Array.from(
                      band.querySelectorAll('[data-slot="stat-item"] > span:last-child'),
                    )
                      .filter((label) => /^\S+$/.test(label.textContent?.trim() ?? ''))
                      .map((label) => {
                        const range = document.createRange();
                        range.selectNodeContents(label);
                        return {
                          text: label.textContent?.trim(),
                          lines: range.getClientRects().length,
                        };
                      }),
                  })),
                );
              expect(statLayout.length, 'nested stat-band is present').toBeGreaterThan(0);
              for (const band of statLayout) {
                expect(band.tracks, 'nested stat-band columns').toBeLessThanOrEqual(2);
                expect(band.labels.length, 'single-word stat labels are present').toBeGreaterThan(
                  0,
                );
                for (const label of band.labels) {
                  expect(label.lines, `stat label ${label.text} stays readable`).toBe(1);
                }
              }
              const cardResults = await main
                .locator('.cms-tree__column [data-slot="case-card"] .project-card-result')
                .evaluateAll((results) =>
                  results.map((result) => {
                    const range = document.createRange();
                    range.selectNodeContents(result);
                    const textEnd = Array.from(range.getClientRects()).at(-1)?.right ?? 0;
                    return {
                      whiteSpace: getComputedStyle(result).whiteSpace,
                      textEnd,
                      right: result.getBoundingClientRect().right,
                    };
                  }),
                );
              expect(cardResults.length, 'nested featured card is present').toBeGreaterThan(0);
              for (const result of cardResults) {
                expect(result.whiteSpace, 'featured description wraps').toBe('normal');
                expect(
                  result.textEnd,
                  'featured description stays inside card',
                ).toBeLessThanOrEqual(result.right + 1);
              }
            }
            const screenshot = await visitor.screenshot({ fullPage: true, animations: 'disabled' });
            const screenshotName = `${locale}-group${group}-${width}-${preview ? 'preview-v1' : 'public-v2'}.png`;
            await testInfo.attach(screenshotName, { body: screenshot, contentType: 'image/png' });
            const layout = await visitor.evaluate(() => ({
              scrollWidth: document.documentElement.scrollWidth,
              bodyWidth: document.body.scrollWidth,
              overflowing: Array.from(
                document.querySelectorAll(
                  '#content > main.cms-core-host :is(.cms-tree__section, .cms-tree__row, .cms-tree__column, [data-host-block-type])',
                ),
              )
                .filter((element) => {
                  const rect = element.getBoundingClientRect();
                  return rect.width && (rect.left < -1 || rect.right > innerWidth + 1);
                })
                .slice(0, 8)
                .map((element) => ({
                  node: element.getAttribute('data-node-id'),
                  slot: element.getAttribute('data-slot'),
                  tag: element.tagName,
                })),
            }));
            expect(
              layout.scrollWidth,
              `${locale}/${width} document overflow: ${JSON.stringify(layout)}`,
            ).toBeLessThanOrEqual(width);
            expect(
              layout.bodyWidth,
              `${locale}/${width} body overflow: ${JSON.stringify(layout)}`,
            ).toBeLessThanOrEqual(width);
            expect(layout.overflowing, `${locale}/${width} host clipping`).toEqual([]);
            captures.push({
              width,
              locale,
              version: preview ? 1 : 2,
              types,
              screenshotName,
              sha256: createHash('sha256').update(screenshot).digest('hex'),
            });
          } finally {
            await context.close();
          }
        }
      }
      expect(captures).toHaveLength(6);
      await testInfo.attach(`${locale}-group${group}-v06-manifest.json`, {
        body: JSON.stringify({
          sourceHead: process.env.E2E_SOURCE_HEAD_SHA ?? null,
          testedMerge: process.env.GITHUB_SHA ?? null,
          runId: process.env.GITHUB_RUN_ID ?? null,
          key,
          captures,
        }),
        contentType: 'application/json',
      });
    });
  }
}
