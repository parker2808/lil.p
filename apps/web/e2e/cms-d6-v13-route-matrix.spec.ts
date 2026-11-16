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
        if (route === '/notes') {
          await expect(page.locator('.public-route-skeleton')).toHaveCount(0);
          const notes = page.locator('main#content .public-notes');
          await expect(notes).toBeVisible();
          await expect(notes.getByRole('heading', { level: 1 })).toBeVisible();
        }
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
  test.setTimeout(180_000);
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
    const pageNames =
      locale === 'en'
        ? { home: 'Home', about: 'About', contact: 'Contact', projects: 'Projects', notes: 'Notes' }
        : {
            home: 'Trang chủ',
            about: 'Giới thiệu',
            contact: 'Liên hệ',
            projects: 'Dự án',
            notes: 'Ghi chú',
          };
    await page.goto('/admin/pages');
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(
      locale === 'en' ? 'Pages' : 'Trang',
    );
    await expect(page).toHaveTitle(locale === 'en' ? 'Pages · Admin' : 'Trang · Quản trị');
    await capture(page, testInfo, entries, locale, 'admin', '/admin/pages');
    for (const [key, name] of Object.entries(pageNames)) {
      const route = `/admin/pages/${key}`;
      const response = await page.goto(route);
      expect(response?.status(), route).toBe(200);
      await expect(page).toHaveTitle(
        locale === 'en' ? `Edit ${name} page · Admin` : `Chỉnh sửa trang ${name} · Quản trị`,
      );
      await expect(
        page.getByRole('link', { name: locale === 'en' ? 'Open page' : 'Mở trang' }),
      ).toBeVisible();
      await capture(page, testInfo, entries, locale, 'admin', route);
    }
    const builder = `/admin/builder/${key}`;
    const response = await page.goto(builder);
    expect(response?.status()).toBe(200);
    await expect(
      page.getByRole('region', {
        name: locale === 'en' ? 'Page builder' : 'Trình dựng trang',
      }),
    ).toBeVisible();
    const publish = page.getByRole('button', {
      name: locale === 'en' ? 'Publish' : 'Xuất bản',
      exact: true,
    });
    const history = page.getByRole('button', {
      name: locale === 'en' ? 'Version history' : 'Lịch sử phiên bản',
      exact: true,
    });
    await expect(publish).toBeVisible();
    await expect(history).toBeVisible();
    const publishBox = (await publish.boundingBox())!;
    const historyBox = (await history.boundingBox())!;
    const viewportWidth = page.viewportSize()!.width;
    for (const box of [publishBox, historyBox]) {
      expect(box.x, builder).toBeGreaterThanOrEqual(0);
      expect(box.x + box.width, builder).toBeLessThanOrEqual(viewportWidth);
    }
    expect(
      publishBox.x + publishBox.width <= historyBox.x ||
        historyBox.x + historyBox.width <= publishBox.x ||
        publishBox.y + publishBox.height <= historyBox.y ||
        historyBox.y + historyBox.height <= publishBox.y,
      builder,
    ).toBe(true);
    for (const button of [publish, history]) {
      expect(
        await button.evaluate((element) => element.scrollWidth <= element.clientWidth),
        builder,
      ).toBe(true);
    }
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
  expect(entries).toHaveLength(16);
  for (let index = 0; index < 6; index++) {
    expect(entries[index]!.title).not.toBe(entries[index + 8]!.title);
  }
  await inventory(testInfo, entries);
});
