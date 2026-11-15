import { expect, test } from '@playwright/test';

import { signIn } from './helpers/auth';

test('nested tree keeps EN/VI SSR without scripts and selects brand by real host in public and preview', async ({
  page,
  browser,
  baseURL,
}, testInfo) => {
  test.setTimeout(180_000);
  await signIn(page);
  const key = `tenant-ssr-${Date.now()}-${testInfo.retry}`;
  const origin = new URL(page.url()).origin;
  const headers = { Origin: origin };
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
              responsive: { base: { text: 'Nested SSR heading', level: 1 } },
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
                      responsive: { base: { text: 'Nested SSR paragraph' } },
                    },
                    {
                      id: 'button',
                      type: 'component',
                      componentType: 'button',
                      responsive: { base: { label: 'Nested SSR action', href: '/projects' } },
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
                      responsive: { base: { text: 'Nested SSR detail' } },
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
    data: { key, title: 'Tenant SSR gate', locale: 'en', template: 'empty' },
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
  for (const locale of ['en', 'vi']) {
    for (const [brand, host] of [
      ['lilp', canonical],
      ['neutral', neutral],
    ] as const) {
      const context = await browser.newContext({
        javaScriptEnabled: false,
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
          const root = visitor.locator('#content > main.cms-core');
          await expect(root).toHaveAttribute('data-brand', brand);
          await expect(root.getByRole('heading', { name: 'Nested SSR heading' })).toBeVisible();
          await expect(root.getByText('Nested SSR paragraph')).toBeVisible();
          await expect(root.getByText('Nested SSR detail')).toBeVisible();
          const action = root.getByRole('link', { name: 'Nested SSR action' });
          await expect(action).toBeVisible();
          const screenshot = await action.screenshot({ animations: 'disabled' });
          const tuple = `${locale}-${brand}-${preview ? 'preview' : 'public'}`;
          await testInfo.attach(`${tuple}-link.png`, {
            body: screenshot,
            contentType: 'image/png',
          });
          await testInfo.attach(`${tuple}-page.png`, {
            body: await visitor.screenshot({ fullPage: true, animations: 'disabled' }),
            contentType: 'image/png',
          });
          captures.set(`${locale}/${brand}/${preview}`, screenshot);
          if (preview) {
            expect(screenshot.equals(captures.get(`${locale}/${brand}/false`)!), tuple).toBe(true);
          }
        }
      } finally {
        await context.close();
      }
    }
    expect(
      captures.get(`${locale}/neutral/false`)!.equals(captures.get(`${locale}/lilp/false`)!),
    ).toBe(false);
  }
});
