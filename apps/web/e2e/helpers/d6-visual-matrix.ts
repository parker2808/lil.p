import AxeBuilder from '@axe-core/playwright';
import { BLOCK_REGISTRY, MARKDOWN_IMAGE_PREFIX } from '@portfolio/contracts';
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
  for (const locale of locales) {
    for (const theme of themes) {
      test(`published host group ${group}: ${locale}, ${theme}, core/brand, mobile/tablet/desktop`, async ({
        page,
      }, testInfo: TestInfo) => {
        test.setTimeout(2 * 60_000);
        await signIn(page);
        await page
          .context()
          .addCookies([
            { name: 'locale-suggest-dismissed', value: '1', url: new URL(page.url()).origin },
          ]);
        const definitions = Object.values(BLOCK_REGISTRY);
        const titles = definitions.filter((definition) => definition.role === 'h1');
        const others = definitions.filter((definition) => definition.role !== 'h1');
        expect(definitions).toHaveLength(20);
        expect(titles).toHaveLength(4);
        const blocks = [titles[group]!, ...others.slice(group * 4, group * 4 + 4)];
        expect(blocks).toHaveLength(5);
        const pageKey = `d6-matrix-${group}-${locale}-${theme}-${Date.now()}-${testInfo.retry}`;
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
        const savedProfile = blocks.some(({ type }) => type === 'cv-download')
          ? await page.request.get('/api/admin/profile')
          : null;
        let uploadedMediaId: number | undefined;
        let resumeFileName: string | undefined;
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
            const media = (await uploaded.json()) as { id: number; fileName: string };
            uploadedMediaId = media.id;
            resumeFileName = media.fileName;
            expect(resumeFileName).toBeTruthy();
            const updated = await page.request.patch('/api/admin/profile', {
              headers,
              data: { resumeEnId: uploadedMediaId, resumeViId: uploadedMediaId },
            });
            expect(updated.status(), await updated.text()).toBe(200);
          }
          const created = await page.request.post('/api/admin/pages', {
            headers,
            data: { key: pageKey, title: `Visual group ${group}`, locale: 'en', template: 'empty' },
          });
          expect(created.status(), await created.text()).toBe(201);
          const activated = await page.request.post(
            `/api/admin/pages/${pageKey}/builder/activate`,
            {
              headers,
              data: { expectedRevision: '0', tree },
            },
          );
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
          const neutralHeroImages = new Map<number, Buffer>();
          const path = `/${locale}/${pageKey}`;
          const publicData = await page.request.get(
            `/api/public/pages/${pageKey}?locale=${locale}`,
          );
          const previewData = await page.request.get(
            `/api/admin/preview/pages/${pageKey}?locale=${locale}&version=1`,
          );
          expect(publicData.status()).toBe(200);
          expect(previewData.status()).toBe(200);
          expect(await previewData.json()).toEqual({
            ...(await publicData.json()),
            invalidBlocks: [],
          });

          await page.goto(path);
          await page.evaluate((value) => localStorage.setItem('theme', value), theme);
          for (const brand of brands) {
            for (const width of widths) {
              await page.setViewportSize({ width, height: 900 });
              const label = `${locale}-${theme}-${brand}-${width}-group${group}`;
              const publicCapture = await capture(
                page,
                path,
                theme,
                brand,
                blocks,
                label,
                testInfo,
                undefined,
                resumeFileName,
              );
              if (group === 0) {
                const heroImage = publicCapture.images.get('hero')!;
                if (brand === 'neutral') {
                  neutralHeroImages.set(width, heroImage);
                } else {
                  const neutralImage = neutralHeroImages.get(width)!;
                  const difference = await imageDifference(page, neutralImage, heroImage);
                  expect(
                    difference.differingPixels,
                    `${label} painted neutral/brand hero`,
                  ).toBeGreaterThan(0);
                }
              }
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
                resumeFileName,
              );
              expect(previewCapture.blocks, `${label} public/preview DOM semantics`).toEqual(
                publicCapture.blocks,
              );
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
          expect(manifest).toHaveLength(6);
          await testInfo.attach(`d6-group-${group}-${locale}-${theme}-manifest.json`, {
            body: JSON.stringify({ pageKey, tuples: manifest }),
            contentType: 'application/json',
          });
        } finally {
          if (savedProfile?.ok()) {
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

async function capture(
  page: Page,
  route: string,
  theme: 'light' | 'dark',
  brand: 'neutral' | 'lilp',
  blocks: Array<(typeof BLOCK_REGISTRY)[keyof typeof BLOCK_REGISTRY]>,
  label: string,
  testInfo: TestInfo,
  publicCapture?: {
    blocks: Array<{ type: string | null; hash: string | null; text: string | undefined }>;
    images: Map<string, Buffer>;
  },
  resumeFileName?: string,
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
  const main = page.locator('#content > main.cms-core-host:visible');
  await expect(main).toHaveCount(1);
  await expect(main).toHaveAttribute('data-brand', 'lilp');
  await main.evaluate(
    (element, values) => {
      element.setAttribute('data-brand', values.brand);
      element.setAttribute('data-theme', values.theme);
    },
    { brand, theme },
  );
  await expect(main).toHaveCSS('color-scheme', theme);
  if (blocks.some(({ type }) => type === 'contact-form')) {
    await expect(
      main.locator('[data-host-block-type="contact-form"] form[data-interactive="true"]'),
      `${label} contact form hydrated before semantic and visual capture`,
    ).toBeVisible();
  }
  const viewport = await page.evaluate(() => ({
    width: window.innerWidth,
    documentWidth: document.documentElement.scrollWidth,
  }));
  expect(viewport.documentWidth, `${label} document horizontal overflow`).toBeLessThanOrEqual(
    viewport.width,
  );
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
  if (blocks.some(({ type }) => type === 'hero')) {
    const heroAccent = main.locator('[data-host-block-type="hero"] .headline-accent');
    await expect(heroAccent, `${label} painted hero accent`).toHaveCSS(
      'color',
      brand === 'neutral'
        ? theme === 'light'
          ? 'rgb(37, 92, 206)'
          : 'rgb(152, 184, 255)'
        : theme === 'light'
          ? 'rgb(179, 50, 26)'
          : 'rgb(255, 143, 116)',
    );
  }
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
  if (blocks.some(({ type }) => type === 'cv-download')) {
    expect(resumeFileName, `${label}/cv-download fixture`).toBeTruthy();
    const cv = main.locator('[data-host-block-type="cv-download"]');
    await expect(cv, `${label}/cv-download painted`).toBeVisible();
    const link = cv.getByRole('link', {
      name: new URL(route, page.url()).pathname.startsWith('/vi/') ? 'Tải CV' : 'Download CV',
    });
    await expect(link).toBeVisible();
    await expect(link).toHaveAttribute('href', `${MARKDOWN_IMAGE_PREFIX}${resumeFileName}`);
    expect(
      hydratedBlocks.find(({ type }) => type === 'cv-download')?.text,
      `${label}/cv-download hydrated text`,
    ).toBe(serverBlocks.find(({ type }) => type === 'cv-download')?.text);
  }
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
    await expect(locator, `${label}/${definition.type} painted component`).toBeVisible();
    const image = await locator.screenshot({
      animations: 'disabled',
      style: '.hero-stage canvas, .site-header, .locale-toast { visibility: hidden !important; }',
    });
    images.set(definition.type, image);
    await testInfo.attach(
      `${label}-${definition.type}-${publicCapture ? 'preview' : 'public'}.png`,
      { body: image, contentType: 'image/png' },
    );
  }
  return { blocks: hydratedBlocks, images };
}
