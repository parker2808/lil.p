import { expect, test } from '@playwright/test';

import { signIn } from './helpers/auth';

for (const locale of ['en', 'vi'] as const) {
  for (const theme of ['light', 'dark'] as const) {
    test(`nested tree keeps ${locale} ${theme} SSR without scripts and selects brand by real host in public and preview`, async ({
      page,
      browser,
      baseURL,
    }, testInfo) => {
      test.setTimeout(180_000);
      await signIn(page);
      const key = `tenant-ssr-${locale}-${theme}-${Date.now()}-${testInfo.retry}`;
      const origin = new URL(page.url()).origin;
      const headers = { Origin: origin };
      const copy =
        locale === 'vi'
          ? {
              heading: 'Nội dung lồng nhau',
              paragraph: 'Đoạn văn lồng nhau',
              action: 'Xem dự án',
              detail: 'Chi tiết lồng nhau',
            }
          : {
              heading: 'Nested SSR heading',
              paragraph: 'Nested SSR paragraph',
              action: 'Nested SSR action',
              detail: 'Nested SSR detail',
            };
      const tree = {
        schemaVersion: 1,
        root: {
          id: 'root',
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
                  responsive: { base: { text: copy.heading, level: 1 } },
                },
                {
                  id: 'row',
                  type: 'row',
                  responsive: { base: {} },
                  columns: [
                    {
                      id: 'column',
                      type: 'column',
                      responsive: { base: { span: 1 } },
                      content: [
                        {
                          id: 'paragraph',
                          type: 'component',
                          componentType: 'paragraph',
                          responsive: { base: { text: copy.paragraph } },
                        },
                        {
                          id: 'button',
                          type: 'component',
                          componentType: 'button',
                          responsive: { base: { label: copy.action, href: `/${locale}/projects` } },
                        },
                      ],
                    },
                    {
                      id: 'column-two',
                      type: 'column',
                      responsive: { base: { span: 1 } },
                      content: [
                        {
                          id: 'nested-detail',
                          type: 'component',
                          componentType: 'paragraph',
                          responsive: { base: { text: copy.detail } },
                        },
                      ],
                    },
                  ],
                },
              ],
            },
          ],
        },
      };
      const created = await page.request.post('/api/admin/pages', {
        headers,
        data: { key, title: copy.heading, locale, template: 'empty' },
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

      const canonical = new URL(baseURL!);
      const neutral = new URL(baseURL!);
      neutral.hostname = 'neutral.localhost';
      const cookies = await page.context().cookies();
      const captures = new Map<string, Buffer>();
      const pageCaptures = new Map<string, Buffer>();
      const publicLinkBoxes = new Map<
        string,
        { x: number; y: number; width: number; height: number }
      >();
      for (const [brand, host] of [
        ['lilp', canonical],
        ['neutral', neutral],
      ] as const) {
        const context = await browser.newContext({
          javaScriptEnabled: false,
          colorScheme: theme,
          storageState: {
            cookies: cookies.map((cookie) => ({ ...cookie, domain: host.hostname })),
            origins: [],
          },
        });
        try {
          const visitor = await context.newPage();
          const route = `/${locale}/${key}`;
          for (const preview of [false, true]) {
            if (preview) {
              const enabled = await visitor.goto(
                new URL(`/api/draft?path=${encodeURIComponent(route)}`, host).href,
              );
              expect(enabled?.url()).toContain(route);
            }
            const response = await visitor.goto(new URL(route, host).href);
            expect(response?.status()).toBe(200);
            expect(await response!.text()).toContain(`data-brand="${brand}"`);
            await expect(visitor.locator('html')).toHaveAttribute('lang', locale);
            const root = visitor.locator('#content > main.cms-core');
            await expect(root).toHaveAttribute('data-brand', brand);
            await expect(root.getByRole('heading', { name: copy.heading })).toBeVisible();
            await expect(root.getByText(copy.paragraph)).toBeVisible();
            await expect(root.getByText(copy.detail)).toBeVisible();
            await expect(root.getByText('Nested SSR heading')).toHaveCount(locale === 'vi' ? 0 : 1);
            const action = root.getByRole('link', { name: copy.action });
            await expect(action).toBeVisible();
            await expect(action).toHaveAttribute('href', `/${locale}/projects`);
            const accent = await root.evaluate((element) =>
              getComputedStyle(element).getPropertyValue('--builder-accent').trim(),
            );
            expect(accent, `${locale}-${theme}-${brand} first-paint theme`).toBe(
              theme === 'dark'
                ? brand === 'neutral'
                  ? '#98b8ff'
                  : '#ffb587'
                : brand === 'neutral'
                  ? '#255cce'
                  : '#a44520',
            );
            if (theme === 'dark') {
              await expect(root).toHaveCSS('color-scheme', 'dark');
            }
            const shell = visitor.locator('.public-site');
            const header = shell.locator('header.site-header');
            const footer = shell.locator('footer.site-footer');
            await expect(header).toBeVisible();
            await expect(footer).toBeVisible();
            expect(
              await shell.evaluate((element) =>
                getComputedStyle(element).getPropertyValue('--background').trim(),
              ),
              `${locale}-${theme}-${brand} no-script shell background`,
            ).toBe(theme === 'dark' ? '#111318' : '#f6f3ec');
            await expect(shell).toHaveCSS('color-scheme', theme === 'dark' ? 'dark' : 'normal');
            await expect(footer).toHaveCSS(
              'background-color',
              theme === 'dark' ? 'rgb(24, 27, 34)' : 'rgb(252, 250, 246)',
            );
            if (theme === 'dark' && !preview) {
              await testInfo.attach(`${locale}-${brand}-nojs-dark-header.png`, {
                body: await header.screenshot({ animations: 'disabled' }),
                contentType: 'image/png',
              });
              await testInfo.attach(`${locale}-${brand}-nojs-dark-footer.png`, {
                body: await footer.screenshot({ animations: 'disabled' }),
                contentType: 'image/png',
              });
            }
            const banner = visitor.locator('[data-slot="draft-banner"]');
            if (preview) {
              await expect(banner).toBeVisible();
            } else {
              await expect(banner).toHaveCount(0);
            }
            const tuple = `${locale}-${theme}-${brand}-${preview ? 'preview' : 'public'}`;
            const pageImage = await visitor.screenshot({ fullPage: true, animations: 'disabled' });
            pageCaptures.set(`${brand}/${preview}`, pageImage);
            await testInfo.attach(`${tuple}-page.png`, {
              body: pageImage,
              contentType: 'image/png',
            });
            if (preview) {
              const bannerBox = await banner.boundingBox();
              expect(bannerBox).not.toBeNull();
              const box = await action.boundingBox();
              expect(box).not.toBeNull();
              expect(
                { ...box!, y: box!.y - bannerBox!.height },
                `${locale}-${theme}-${brand} content geometry without preview chrome`,
              ).toEqual(publicLinkBoxes.get(`${locale}/${theme}/${brand}`));
            }
            const box = await action.boundingBox();
            expect(box).not.toBeNull();
            if (!preview) {
              publicLinkBoxes.set(`${locale}/${theme}/${brand}`, box!);
            }
            const screenshot = await action.screenshot({
              animations: 'disabled',
              ...(preview
                ? { style: '[data-slot="draft-banner"] { display: none !important; }' }
                : {}),
            });
            await testInfo.attach(`${tuple}-link.png`, {
              body: screenshot,
              contentType: 'image/png',
            });
            captures.set(`${locale}/${theme}/${brand}/${preview}`, screenshot);
            if (preview) {
              expect(
                screenshot.equals(captures.get(`${locale}/${theme}/${brand}/false`)!),
                tuple,
              ).toBe(true);
            }
          }
        } finally {
          await context.close();
        }
      }
      expect(pageCaptures.get('neutral/false')!.equals(pageCaptures.get('lilp/false')!)).toBe(
        false,
      );
    });
  }
}
