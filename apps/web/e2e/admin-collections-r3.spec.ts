import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

import { expect, test, type Page } from '@playwright/test';

import { signIn } from './helpers/auth';
import { E2E_USER } from './helpers/credentials';

const OUTPUT = join(process.env.HOME ?? '/tmp', 'Desktop/lilp-admin-demo-20261102');
const ROUTES = [
  ['projects', 'Projects', 'Dự án'],
  ['posts', 'Posts', 'Bài viết'],
  ['experience', 'Experience', 'Kinh nghiệm'],
  ['education', 'Education', 'Học vấn'],
  ['skills', 'Skills', 'Kỹ năng'],
  ['tags', 'Tags', 'Thẻ'],
  ['principles', 'Principles', 'Nguyên tắc'],
  ['process', 'Process steps', 'Các bước quy trình'],
  ['users', 'Users', 'Người dùng'],
  ['inbox', 'Inbox', 'Hộp thư'],
  ['domains', 'Domains', 'Lĩnh vực'],
  ['media', 'Media', 'Thư viện'],
] as const;

type Locale = 'en' | 'vi';
type Entry = {
  route: string;
  locale: Locale;
  state: string;
  theme: string;
  width: number;
  file: string;
};

async function setLocale(page: Page, locale: Locale) {
  await page
    .context()
    .addCookies([{ name: 'NEXT_LOCALE', value: locale, domain: '127.0.0.1', path: '/' }]);
}

async function capture(
  page: Page,
  entries: Entry[],
  route: string,
  locale: Locale,
  state: string,
  heading: string,
) {
  await mkdir(OUTPUT, { recursive: true });
  for (const theme of ['light', 'dark'] as const) {
    await page.evaluate((next) => localStorage.setItem('theme', next), theme);
    await page.reload();
    await expect(page.locator('html')).toHaveAttribute('lang', locale);
    await expect(page.locator('html')).toHaveClass(new RegExp(`\\b${theme}\\b`));
    for (const width of [1440, 390]) {
      await page.setViewportSize({ width, height: 900 });
      await expect(page.getByRole('heading', { name: heading, exact: true }).first()).toBeVisible();
      await expect(page.locator('body')).not.toContainText('Internal Server Error');
      expect(
        await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1),
      ).toBe(true);
      const file = `${route}-${locale}-${state}-${theme}-${width}.png`;
      await page.screenshot({
        path: join(OUTPUT, file),
        animations: 'disabled',
        style: 'input[type=email],a[href^="mailto:"]{visibility:hidden!important}',
      });
      entries.push({ route, locale, state, theme, width, file });
    }
  }
}

for (const locale of ['en', 'vi'] as const) {
  test(`real admin collection routes and controls in ${locale}`, async ({ page }) => {
    test.setTimeout(600_000);
    const entries: Entry[] = [];
    await signIn(page);
    await setLocale(page, locale);
    const createEducation = await page.request.post('/api/admin/education', {
      headers: { Origin: new URL(page.url()).origin },
      data: {
        school: 'Example Academy',
        degreeEn: 'Certificate',
        degreeVi: 'Chứng chỉ',
        majorEn: 'Interface design',
        majorVi: 'Thiết kế giao diện',
        startDate: '2022-01-01T00:00:00.000Z',
        endDate: '2023-01-01T00:00:00.000Z',
        isVisible: true,
      },
    });
    expect(createEducation.ok()).toBe(true);

    for (const [route, en, vi] of ROUTES) {
      await page.goto(`/admin/${route}`);
      await capture(page, entries, route, locale, 'normal', locale === 'en' ? en : vi);
    }

    await page.goto('/admin/projects');
    const search = page.getByRole('textbox', {
      name: locale === 'en' ? 'Filter projects' : 'Lọc dự án',
    });
    await search.fill('no-matching-project-r3');
    await search.press('Enter');
    await expect(page).toHaveURL(/q=no-matching-project-r3/);
    await capture(
      page,
      entries,
      'projects',
      locale,
      'filtered-empty',
      locale === 'en' ? 'Projects' : 'Dự án',
    );
    await expect(search).toHaveValue('no-matching-project-r3');

    await page.goto('/admin/education');
    await page.setViewportSize({ width: 390, height: 900 });
    const cards = page.locator('[data-education-card]');
    await expect(cards.nth(1)).toBeVisible();
    expect(
      await cards
        .nth(1)
        .evaluate((node) => node.getBoundingClientRect().right <= window.innerWidth),
    ).toBe(true);
    const card = cards.nth(1);
    expect(
      await card
        .locator('[data-education-copy]')
        .evaluate((node) => getComputedStyle(node).minWidth),
    ).toBe('0px');
    expect(
      await card
        .locator('[data-education-copy]')
        .evaluate((node) => parseFloat(getComputedStyle(node).rowGap)),
    ).toBeGreaterThan(0);
    await expect(card.locator('[data-education-pill]')).toHaveCSS('white-space', 'nowrap');
    for (const control of await card.getByRole('button').all()) {
      const box = await control.boundingBox();
      expect(box?.width).toBeGreaterThanOrEqual(44);
      expect(box?.height).toBeGreaterThanOrEqual(44);
    }
    expect(
      await card
        .getByRole('button')
        .first()
        .evaluate((button) => {
          const outer = button.getBoundingClientRect();
          const icon = button.querySelector('svg')!.getBoundingClientRect();
          return Math.abs(icon.x + icon.width / 2 - (outer.x + outer.width / 2));
        }),
    ).toBeLessThan(1);
    await card.getByRole('button').last().focus();
    await expect(card.getByRole('button').last()).toBeFocused();
    await cards.first().getByRole('button').last().click();
    await expect(page.getByRole('menu')).toBeVisible();
    await page.getByRole('menuitem', { name: locale === 'en' ? 'Next' : 'Sau' }).click();
    await expect(cards.first()).toContainText('Example Academy');
    await capture(
      page,
      entries,
      'education',
      locale,
      'reordered',
      locale === 'en' ? 'Education' : 'Học vấn',
    );

    await page.goto('/admin/media');
    await page.setViewportSize({ width: 390, height: 900 });
    const mediaItem = {
      id: 777,
      fileName: 'example.pdf',
      originalName: 'example.pdf',
      mimeType: 'application/pdf',
      sizeBytes: 1024,
      width: null,
      height: null,
      altEn: '',
      altVi: '',
      resourceType: 'raw',
      uploadedById: null,
      url: '/mock/avatar.svg',
      srcset: '',
      createdAt: '2026-11-03T00:00:00.000Z',
    };
    await page.route('**/api/admin/media?*', (route) =>
      route.fulfill({ json: { items: [mediaItem], nextCursor: null } }),
    );
    await page.route('**/api/admin/media/777', (route) =>
      route.request().method() === 'PATCH'
        ? route.fulfill({ json: { ...mediaItem, altEn: 'Example document' } })
        : route.fulfill({ status: 204, body: '' }),
    );
    await page.reload();
    const art = page.locator('[data-media-art]').first();
    await expect(art).toBeVisible();
    expect(
      await art.evaluate((node) => parseFloat(getComputedStyle(node.parentElement!).paddingLeft)),
    ).toBeGreaterThan(0);
    expect(
      await art.evaluate((node) => parseFloat(getComputedStyle(node).borderTopLeftRadius)),
    ).toBeGreaterThan(0);
    expect(
      await art.evaluate((node) => {
        const outer = node.getBoundingClientRect();
        const icon = node.querySelector('svg')!.getBoundingClientRect();
        return Math.abs(icon.x + icon.width / 2 - (outer.x + outer.width / 2));
      }),
    ).toBeLessThan(1);
    await capture(
      page,
      entries,
      'media',
      locale,
      'populated',
      locale === 'en' ? 'Media' : 'Thư viện',
    );
    await page.setViewportSize({ width: 390, height: 900 });
    await page.locator('[data-slot="media-library"] button').first().click();
    await expect(page.getByRole('dialog')).toBeVisible();
    await page
      .getByRole('textbox', {
        name: locale === 'en' ? 'Alt text (English)' : 'Văn bản thay thế (tiếng Anh)',
      })
      .fill('Example document');
    await page
      .getByRole('button', { name: locale === 'en' ? 'Save alt' : 'Lưu văn bản thay thế' })
      .click();
    await expect(page.getByRole('dialog')).toBeHidden();
    await page.locator('[data-slot="media-library"] button').first().click();
    await page.getByRole('button', { name: locale === 'en' ? 'Delete' : 'Xóa' }).click();
    await expect(page.getByRole('alertdialog')).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(page.getByRole('alertdialog')).toBeHidden();
    await page.keyboard.press('Escape');

    const sender = `Example sender ${locale}`;
    const contact = await page.request.post('/api/public/contact', {
      headers: { Origin: new URL(page.url()).origin },
      data: { name: sender, email: E2E_USER.email, message: 'Example message', locale },
    });
    expect(contact.ok()).toBe(true);
    await page.goto('/admin/inbox');
    await expect(
      page.getByRole('heading', { name: locale === 'en' ? 'Inbox' : 'Hộp thư' }),
    ).toBeVisible();
    await page.getByRole('link', { name: new RegExp(sender) }).click();
    await expect(page.locator('article').getByRole('heading', { name: sender })).toBeVisible();
    await expect(
      page.locator('main').getByRole('link', {
        name: locale === 'en' ? 'Back to Inbox' : 'Về Hộp thư',
      }),
    ).toBeVisible();
    await capture(page, entries, 'inbox-detail', locale, 'read', sender);

    await writeFile(
      join(OUTPUT, `admin-collections-manifest-${locale}.json`),
      JSON.stringify(entries, null, 2),
    );
  });
}
