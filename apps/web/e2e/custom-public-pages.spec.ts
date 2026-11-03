import { mkdir, writeFile } from 'node:fs/promises';
import { join, resolve } from 'node:path';

import { expect, test, type Page } from '@playwright/test';

import { signIn } from './helpers/auth';

const folder = resolve(process.env.HOME ?? '', 'Desktop/lilp-design-demo-20261102');
const key = 'studio-notes';
const copy = {
  en: 'A complete page about the studio and its work.',
  vi: 'Trang giới thiệu đầy đủ về studio và công việc.',
};
const newerCopy = {
  en: 'Fresh draft copy about the studio and its work.',
  vi: 'Bản nháp mới về studio và công việc.',
};
const captures: Array<{
  route: string;
  locale: string;
  state: string;
  theme: string;
  width: number;
  file: string;
}> = [];

async function capture(page: Page, locale: string, state: string, theme: string, width: number) {
  await mkdir(folder, { recursive: true });
  const file = `${key}-${locale}-${state}-${theme}-${width}.png`;
  await page.screenshot({ path: join(folder, file), fullPage: true, animations: 'disabled' });
  captures.push({ route: key, locale, state, theme, width, file });
}

async function visit(page: Page, locale: string, theme: string, width: number, path: string) {
  await page.setViewportSize({ width, height: 900 });
  await page.goto('/en/about');
  await page.evaluate((value) => localStorage.setItem('theme', value), theme);
  return page.goto(path);
}

test.setTimeout(240_000);

test('published custom page, draft denial, version preview and static route precedence', async ({
  page,
}) => {
  if (process.env.CUSTOM_PAGE_MOCK_API === '1') {
    await page.goto('/admin/login');
    await page
      .context()
      .addCookies([{ name: 'access_token', value: 'mock', domain: 'localhost', path: '/' }]);
  } else {
    await signIn(page);
  }
  await page.context().addCookies([
    {
      name: 'locale-suggest-dismissed',
      value: '1',
      domain: new URL(page.url()).hostname,
      path: '/',
    },
  ]);
  const origin = new URL(page.url()).origin;
  const created = await page.request.post('/api/admin/pages', {
    headers: { Origin: origin },
    data: { title: 'Studio notes', key, locale: 'en', template: 'starter' },
  });
  expect(created.status(), await created.text()).toBe(201);
  const draft = (await created.json()) as {
    blocks: Array<{ id: number; type: string; props: unknown }>;
  };
  const prose = draft.blocks.find((block) => block.type === 'prose');
  expect(prose).toBeTruthy();
  const patched = await page.request.patch(`/api/admin/pages/${key}/blocks/${prose!.id}`, {
    headers: { Origin: origin },
    data: { props: { body: copy } },
  });
  expect(patched.ok(), await patched.text()).toBeTruthy();

  for (const locale of ['en', 'vi'])
    for (const width of [1440, 390])
      for (const theme of ['light', 'dark']) {
        const publicDraft = await visit(page, locale, theme, width, `/${locale}/${key}`);
        expect(publicDraft?.status()).toBe(404);
        await expect(page.locator('main h1')).toBeVisible();
        await capture(page, locale, 'draft-404', theme, width);
      }
  const nested = await page.request.get(`/en/${key}/child`);
  expect(nested.status()).toBe(404);
  const craft = await page.request.get('/en/craft');
  expect(craft.status()).toBe(404);
  const builtIn = await page.request.get('/en/about');
  expect(builtIn.status()).toBe(200);

  const adminPreview = await page.request.get(`/api/admin/preview/pages/${key}?locale=en`);
  expect(adminPreview.ok(), await adminPreview.text()).toBeTruthy();
  await page.goto(`/api/draft?path=${encodeURIComponent(`/en/${key}`)}`);
  await expect(page).toHaveURL(new RegExp(`/en/${key}$`));
  expect(
    (await page.context().cookies()).some((cookie) => cookie.name === '__prerender_bypass'),
  ).toBe(true);
  await expect(page.locator('[data-slot="draft-banner"]')).toBeVisible();
  await expect(page.getByText(copy.en)).toBeVisible();
  const published = await page.request.post(`/api/admin/pages/${key}/publish`, {
    headers: { Origin: origin },
    data: {},
  });
  expect(published.ok(), await published.text()).toBeTruthy();
  await page.goto(`/api/draft?exit=1&path=${encodeURIComponent(`/en/${key}`)}`);

  const sitemap = await page.request.get('/sitemap.xml');
  expect(await sitemap.text()).toContain(`/en/${key}`);
  expect(await sitemap.text()).toContain(`/vi/${key}`);

  for (const locale of ['en', 'vi']) {
    for (const width of [1440, 390]) {
      for (const theme of ['light', 'dark']) {
        await visit(page, locale, theme, width, `/${locale}/${key}`);
        await expect(page.getByText(copy[locale as 'en' | 'vi'])).toBeVisible();
        expect(await page.title()).toContain('Studio notes');
        await expect(page.locator('html')).toHaveClass(new RegExp(`(?:^|\\s)${theme}(?:\\s|$)`));
        await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
          'href',
          new RegExp(`/${locale}/${key}$`),
        );
        await expect(page.locator('link[hreflang="en"]')).toHaveAttribute(
          'href',
          /\/en\/studio-notes$/,
        );
        await expect(page.locator('link[hreflang="vi"]')).toHaveAttribute(
          'href',
          /\/vi\/studio-notes$/,
        );
        const home = page.locator('.site-header a:has(.brand-mark)');
        await home.focus();
        await expect(home).toBeFocused();
        await capture(page, locale, 'published', theme, width);
      }
    }
  }

  const revised = await page.request.patch(`/api/admin/pages/${key}/blocks/${prose!.id}`, {
    headers: { Origin: origin },
    data: { props: { body: newerCopy } },
  });
  expect(revised.ok(), await revised.text()).toBeTruthy();
  for (const locale of ['en', 'vi'])
    for (const width of [1440, 390])
      for (const theme of ['light', 'dark']) {
        await visit(page, locale, theme, width, `/${locale}/${key}`);
        await page.goto(`/api/draft?path=${encodeURIComponent(`/${locale}/${key}`)}`);
        await expect(page.locator('[data-slot="draft-banner"]')).toBeVisible();
        await expect(page.getByText(newerCopy[locale as 'en' | 'vi'])).toBeVisible();
        await capture(page, locale, 'preview', theme, width);
        await page.goto(`/${locale}/${key}?v=1`);
        await expect(page.getByText(copy[locale as 'en' | 'vi'])).toBeVisible();
        await capture(page, locale, 'version', theme, width);
        await page.goto(`/api/draft?exit=1&path=${encodeURIComponent(`/${locale}/${key}`)}`);
      }

  const republished = await page.request.post(`/api/admin/pages/${key}/publish`, {
    headers: { Origin: origin },
    data: {},
  });
  expect(republished.ok(), await republished.text()).toBeTruthy();
  await expect(async () => {
    await page.goto(`/en/${key}`);
    await expect(page.getByText(newerCopy.en)).toBeVisible({ timeout: 2_000 });
  }).toPass({ timeout: 30_000 });

  await writeFile(
    join(folder, 'r3-03-custom-pages-manifest.json'),
    JSON.stringify(captures, null, 2),
  );
});
