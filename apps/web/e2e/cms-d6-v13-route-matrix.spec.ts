import { expect, test, type Page, type TestInfo } from '@playwright/test';

import { signIn } from './helpers/auth';

const publicRoutes = ['', '/about', '/contact', '/projects', '/notes'] as const;

type Entry = {
  route: string;
  locale: 'en' | 'vi';
  state: 'public' | 'preview' | 'missing' | 'admin' | 'builder' | 'admin-missing';
  title: string;
  description: string | null;
  image: string;
};

async function capture(
  page: Page,
  testInfo: TestInfo,
  entries: Entry[],
  locale: Entry['locale'],
  state: Entry['state'],
  route: string,
) {
  const title = await page.title();
  expect(title, route).toBeTruthy();
  await expect(page.locator('html'), route).toHaveAttribute('lang', locale);
  const descriptionTag = page.locator('meta[name="description"]');
  const description = (await descriptionTag.count())
    ? await descriptionTag.getAttribute('content')
    : null;
  if (state === 'public' || state === 'preview') {
    expect(description, route).toBeTruthy();
  } else {
    expect(await descriptionTag.count(), route).toBe(0);
  }
  const image = `${locale}-${state}-${entries.length}.png`;
  await testInfo.attach(image, {
    body: await page.screenshot({ animations: 'disabled' }),
    contentType: 'image/png',
  });
  entries.push({ route, locale, state, title, description, image });
}

async function inventory(testInfo: TestInfo, entries: Entry[]) {
  await testInfo.attach('v13-route-state-inventory.json', {
    body: Buffer.from(JSON.stringify({ entries }, null, 2)),
    contentType: 'application/json',
  });
}

test('EN/VI public and draft route metadata, fallback and capture inventory', async ({
  page,
}, testInfo) => {
  test.setTimeout(180_000);
  await signIn(page);
  const entries: Entry[] = [];
  for (const locale of ['en', 'vi'] as const) {
    for (const state of ['public', 'preview'] as const) {
      const path = `/${locale}`;
      await page.goto(
        state === 'preview'
          ? `/api/draft?path=${encodeURIComponent(path)}`
          : `/api/draft?exit=1&path=${encodeURIComponent(path)}`,
      );
      const titles = new Set<string>();
      for (const route of publicRoutes) {
        const path = `/${locale}${route}`;
        const response = await page.goto(path);
        expect(response?.status(), path).toBe(200);
        await expect(page.locator('meta[property="og:image"]'), path).toHaveAttribute(
          'content',
          /\/opengraph-image/,
        );
        await capture(page, testInfo, entries, locale, state, path);
        const title = entries.at(-1)!.title;
        expect(titles.has(title), path).toBe(false);
        titles.add(title);
      }
    }
    await page.goto(`/api/draft?exit=1&path=${encodeURIComponent(`/${locale}`)}`);
    const missing = `/${locale}/v13-route-does-not-exist`;
    const response = await page.goto(missing);
    expect([200, 404]).toContain(response?.status());
    await expect(
      page.getByRole('heading', {
        level: 1,
        name: locale === 'en' ? 'This page is missing' : 'Không tìm thấy trang này',
      }),
    ).toBeVisible();
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', /noindex/);
    await expect(
      page
        .getByRole('navigation', {
          name: locale === 'en' ? 'Explore the site' : 'Khám phá trang web',
        })
        .getByRole('link', {
          name: locale === 'en' ? 'Home' : 'Trang chủ',
        }),
    ).toHaveAttribute('href', `/${locale}`);
    await capture(page, testInfo, entries, locale, 'missing', missing);
  }
  expect(entries).toHaveLength(22);
  for (const offset of [0, publicRoutes.length]) {
    expect(entries[offset]!.description).not.toBe(entries[offset + 11]!.description);
  }
  await inventory(testInfo, entries);
});

test('EN/VI admin page, builder help and missing-state metadata inventory', async ({
  page,
  context,
}, testInfo) => {
  test.setTimeout(120_000);
  await signIn(page);
  const origin = new URL(page.url()).origin;
  const key = `v13-matrix-${Date.now()}-${testInfo.retry}`;
  const created = await page.request.post('/api/admin/pages', {
    headers: { Origin: origin },
    data: { key, title: 'V13 route matrix', locale: 'en', template: 'starter' },
  });
  expect(created.status(), await created.text()).toBe(201);
  const entries: Entry[] = [];
  for (const locale of ['en', 'vi'] as const) {
    await context.addCookies([{ name: 'NEXT_LOCALE', value: locale, url: origin }]);
    for (const route of ['/admin/pages/home', '/admin/pages/about']) {
      const response = await page.goto(route);
      expect(response?.status(), route).toBe(200);
      await capture(page, testInfo, entries, locale, 'admin', route);
    }
    const builder = `/admin/builder/${key}`;
    const response = await page.goto(builder);
    expect(response?.status()).toBe(200);
    await expect(
      page.getByRole('navigation', {
        name: locale === 'en' ? 'Page builder' : 'Trình dựng trang',
      }),
    ).toBeVisible();
    await capture(page, testInfo, entries, locale, 'builder', builder);
    const missing = '/admin/v13-route-does-not-exist';
    const notFound = await page.goto(missing);
    expect(notFound?.status()).toBe(404);
    await expect(
      page.getByRole('heading', {
        level: 1,
        name: locale === 'en' ? 'Admin page not found' : 'Không tìm thấy trang quản trị',
      }),
    ).toBeVisible();
    await expect(
      page.getByRole('link', {
        name: locale === 'en' ? 'Back to dashboard' : 'Về bảng điều khiển',
      }),
    ).toHaveAttribute('href', '/admin');
    await capture(page, testInfo, entries, locale, 'admin-missing', missing);
  }
  expect(entries).toHaveLength(8);
  for (let index = 0; index < 2; index++) {
    expect(entries[index]!.title).not.toBe(entries[index + 4]!.title);
  }
  await inventory(testInfo, entries);
});
