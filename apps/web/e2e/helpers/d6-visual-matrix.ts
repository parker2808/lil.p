import AxeBuilder from '@axe-core/playwright';
import { BLOCK_REGISTRY } from '@portfolio/contracts';
import { expect, test, type Page, type TestInfo } from '@playwright/test';

import { signIn } from './auth';

export async function imageDifference(page: Page, publicImage: Buffer, previewImage: Buffer) {
  return page.evaluate(
    async ([publicBase64, previewBase64]) => {
      const decode = async (base64: string) => {
        const bytes = Uint8Array.from(atob(base64), (character) => character.charCodeAt(0));
        return createImageBitmap(new Blob([bytes], { type: 'image/png' }));
      };
      const [published, preview] = await Promise.all([
        decode(publicBase64!),
        decode(previewBase64!),
      ]);
      if (published.width !== preview.width || published.height !== preview.height) {
        return { differingPixels: Infinity, totalPixels: 0 };
      }
      const canvas = document.createElement('canvas');
      canvas.width = published.width;
      canvas.height = published.height;
      const context = canvas.getContext('2d', { willReadFrequently: true })!;
      context.drawImage(published, 0, 0);
      const publishedPixels = context.getImageData(0, 0, canvas.width, canvas.height).data;
      context.clearRect(0, 0, canvas.width, canvas.height);
      context.drawImage(preview, 0, 0);
      const previewPixels = context.getImageData(0, 0, canvas.width, canvas.height).data;
      let differingPixels = 0;
      for (let index = 0; index < publishedPixels.length; index += 4) {
        if (
          [0, 1, 2, 3].some(
            (channel) =>
              Math.abs(publishedPixels[index + channel]! - previewPixels[index + channel]!) > 10,
          )
        ) {
          differingPixels++;
        }
      }
      published.close();
      preview.close();
      return { differingPixels, totalPixels: canvas.width * canvas.height };
    },
    [publicImage.toString('base64'), previewImage.toString('base64')],
  );
}

const widths = [390, 768, 1440] as const;
const locales = ['en', 'vi'] as const;
const themes = ['light', 'dark'] as const;
const brands = ['neutral', 'lilp'] as const;

export function registerVisualMatrix(group: number) {
  test(`published host group ${group}: EN/VI, core/brand, light/dark, mobile/tablet/desktop`, async ({
    page,
  }, testInfo: TestInfo) => {
    test.setTimeout(16 * 60_000);
    await signIn(page);
    const definitions = Object.values(BLOCK_REGISTRY);
    const titles = definitions.filter((definition) => definition.role === 'h1');
    const others = definitions.filter((definition) => definition.role !== 'h1');
    expect(definitions).toHaveLength(20);
    expect(titles).toHaveLength(4);
    const blocks = [titles[group]!, ...others.slice(group * 4, group * 4 + 4)];
    expect(blocks).toHaveLength(5);
    const pageKey = `d6-matrix-${group}-${Date.now()}-${testInfo.retry}`;
    const headers = { Origin: new URL(page.url()).origin };
    const tree = {
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
      data: { key: pageKey, title: `Visual group ${group}`, locale: 'en', template: 'empty' },
    });
    expect(created.status(), await created.text()).toBe(201);
    const activated = await page.request.post(`/api/admin/pages/${pageKey}/builder/activate`, {
      headers,
      data: { expectedRevision: '0', tree },
    });
    expect(activated.status(), await activated.text()).toBe(200);
    const published = await page.request.post(`/api/admin/pages/${pageKey}/builder/publish`, {
      headers,
      data: { expectedRevision: '1' },
    });
    expect(published.status(), await published.text()).toBe(200);

    const manifest: Array<{
      locale: string;
      theme: string;
      brand: string;
      width: number;
      types: string[];
    }> = [];
    for (const locale of locales) {
      const path = `/${locale}/${pageKey}`;
      const publicData = await page.request.get(`/api/public/pages/${pageKey}?locale=${locale}`);
      const previewData = await page.request.get(
        `/api/admin/preview/pages/${pageKey}?locale=${locale}&version=1`,
      );
      expect(publicData.status()).toBe(200);
      expect(previewData.status()).toBe(200);
      expect(await previewData.json()).toEqual({ ...(await publicData.json()), invalidBlocks: [] });

      for (const theme of themes) {
        await page.goto(path);
        await page.evaluate((value) => localStorage.setItem('theme', value), theme);
        for (const brand of brands) {
          for (const width of widths) {
            await page.setViewportSize({ width, height: 900 });
            const label = `${locale}-${theme}-${brand}-${width}-group${group}`;
            const publicCapture = await capture(page, path, theme, brand, blocks, label, testInfo);
            await page.goto(`/api/draft?path=${encodeURIComponent(path)}`);
            const previewCapture = await capture(
              page,
              `${path}?v=1`,
              theme,
              brand,
              blocks,
              label,
              testInfo,
              publicCapture,
            );
            expect(previewCapture.markup, `${label} public/preview DOM`).toBe(publicCapture.markup);
            for (const definition of blocks) {
              const difference = await imageDifference(
                page,
                publicCapture.images.get(definition.type)!,
                previewCapture.images.get(definition.type)!,
              );
              expect(
                difference.differingPixels / difference.totalPixels,
                `${label}/${definition.type} public/preview pixels`,
              ).toBeLessThanOrEqual(0.005);
            }
            await page.goto(`/api/draft?exit=1&path=${encodeURIComponent(path)}`);
            manifest.push({ locale, theme, brand, width, types: blocks.map(({ type }) => type) });
          }
        }
      }
    }
    expect(manifest).toHaveLength(24);
    await testInfo.attach(`d6-group-${group}-manifest.json`, {
      body: JSON.stringify({ pageKey, tuples: manifest }),
      contentType: 'application/json',
    });
  });
}

async function capture(
  page: Page,
  route: string,
  theme: 'light' | 'dark',
  brand: 'neutral' | 'lilp',
  blocks: Array<(typeof BLOCK_REGISTRY)[keyof typeof BLOCK_REGISTRY]>,
  label: string,
  testInfo: TestInfo,
  publicCapture?: { markup: string; images: Map<string, Buffer> },
) {
  const serverResponse = await page.request.get(route);
  expect(serverResponse.status(), route).toBe(200);
  const serverHtml = await serverResponse.text();
  const serverBlocks = await page.evaluate((html) => {
    const doc = new DOMParser().parseFromString(html, 'text/html');
    return Array.from(doc.querySelectorAll('main.cms-core [data-host-block-type]')).map(
      (element) => ({
        type: element.getAttribute('data-host-block-type'),
        hash: element.getAttribute('data-host-props-hash'),
        text: element.textContent?.replace(/\s+/g, ' ').trim(),
      }),
    );
  }, serverHtml);
  expect(
    serverBlocks.map(({ type }) => type),
    `${route} SSR inventory`,
  ).toEqual(blocks.map(({ type }) => type));
  const response = await page.goto(route);
  expect(response?.status(), route).toBe(200);
  await expect(page.locator('html')).toHaveClass(theme === 'dark' ? /\bdark\b/ : /\blight\b/);
  const main = page.locator('main.cms-core-host');
  await expect(main).toHaveAttribute('data-brand', 'lilp');
  await main.evaluate(
    (element, values) => {
      element.setAttribute('data-brand', values.brand);
      element.setAttribute('data-theme', values.theme);
    },
    { brand, theme },
  );
  await expect(main).toHaveCSS('color-scheme', theme);
  const accent = await main.evaluate((element) =>
    getComputedStyle(element).getPropertyValue('--builder-accent').trim(),
  );
  expect(accent, `${label} real brand token`).toBe(
    brand === 'neutral'
      ? theme === 'light'
        ? '#255cce'
        : '#98b8ff'
      : theme === 'light'
        ? '#a44520'
        : '#ffb587',
  );
  const hydratedBlocks = await main.locator('[data-host-block-type]').evaluateAll((elements) =>
    elements.map((element) => ({
      type: element.getAttribute('data-host-block-type'),
      hash: element.getAttribute('data-host-props-hash'),
      text: element.textContent?.replace(/\s+/g, ' ').trim(),
    })),
  );
  expect(
    hydratedBlocks.map(({ type, hash }) => ({ type, hash })),
    `${label} SSR/hydration block contract`,
  ).toEqual(serverBlocks.map(({ type, hash }) => ({ type, hash })));
  for (const block of serverBlocks) {
    expect(block.text, `${label}/${block.type} initial SSR text`).toBeTruthy();
  }
  const markup = await main.innerHTML();
  const axe = await new AxeBuilder({ page })
    .include('main.cms-core-host')
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
    .analyze();
  await testInfo.attach(`${label}-${publicCapture ? 'preview' : 'public'}-axe.json`, {
    body: JSON.stringify(axe.violations),
    contentType: 'application/json',
  });
  expect(axe.violations, `${label} WCAG AA`).toEqual([]);
  const images = new Map<string, Buffer>();
  for (const definition of blocks) {
    const locator = main.locator(`[data-host-block-type="${definition.type}"]`);
    await expect(locator).toHaveCount(1);
    const image = await locator.screenshot({
      animations: 'disabled',
      style: '.hero-stage canvas { visibility: hidden !important; }',
    });
    images.set(definition.type, image);
    await testInfo.attach(
      `${label}-${definition.type}-${publicCapture ? 'preview' : 'public'}.png`,
      { body: image, contentType: 'image/png' },
    );
  }
  return { markup, images };
}
