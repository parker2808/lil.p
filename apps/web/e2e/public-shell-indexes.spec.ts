import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

import { expect, test } from '@playwright/test';

import { expectNoSeriousAxeIssues } from './helpers/axe';
import { E2E_VISITOR } from './helpers/credentials';

const routes = ['home', 'projects', 'notes', 'about', 'contact', 'craft'] as const;
const widths = [1440, 390] as const;
const themes = ['light', 'dark'] as const;
const captureDir = process.env.R3_CAPTURE_DIR;

type Capture = {
  route: string;
  locale: string;
  state: string;
  theme: string;
  width: number;
  file: string;
};

async function capture(page: import('@playwright/test').Page, tuple: Omit<Capture, 'file'>) {
  await page.setViewportSize({ width: tuple.width, height: tuple.width === 390 ? 844 : 900 });
  await page.evaluate((theme) => {
    localStorage.setItem('theme', theme);
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, tuple.theme);
  await expect(page.locator('main#content h1').first()).toBeVisible();
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - innerWidth);
  expect(overflow, `${tuple.route} ${tuple.locale} ${tuple.width} overflow`).toBeLessThanOrEqual(1);
  if (!captureDir) return;
  await mkdir(captureDir, { recursive: true });
  const file = `${tuple.route}-${tuple.locale}-${tuple.state}-${tuple.theme}-${tuple.width}.png`;
  await page.screenshot({ path: join(captureDir, file), fullPage: true, animations: 'disabled' });
  const manifestPath = join(captureDir, 'r3-05-manifest.json');
  let previous: Capture[] = [];
  try {
    previous = JSON.parse(await readFile(manifestPath, 'utf8')) as Capture[];
  } catch {
    /* first capture */
  }
  const next = previous.filter((entry) => entry.file !== file);
  next.push({ ...tuple, file });
  await writeFile(
    manifestPath,
    JSON.stringify(
      next.sort((a, b) => a.file.localeCompare(b.file)),
      null,
      2,
    ),
  );
}

test('real public indexes, filters, contact and captures in EN/VI', async ({ page }) => {
  test.setTimeout(600_000);
  page.setDefaultTimeout(15_000);
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(message.text());
  });

  for (const locale of ['en', 'vi'] as const) {
    for (const route of routes) {
      await page.goto(`/${locale}${route === 'home' ? '' : `/${route}`}`);
      await expect(page.locator('main#content h1').first()).toBeVisible();
      await expect(page.locator('nextjs-portal')).toHaveCount(0);
      for (const theme of themes)
        for (const width of widths) {
          await capture(page, { route, locale, state: 'normal', theme, width });
        }
      await page.evaluate(async () => {
        await Promise.all(
          document
            .getAnimations()
            .filter((animation) => animation instanceof CSSTransition)
            .map((animation) => animation.finished.catch(() => undefined)),
        );
      });
      await expectNoSeriousAxeIssues(page);
      if (route === 'projects') {
        const card = page.locator('.projects-results .redesign-case-card').first();
        await expect(card).toBeVisible();
        const geometry = await card.evaluate((element) => {
          const cover = element.querySelector('img, .redesign-cover-placeholder');
          const box = element.getBoundingClientRect();
          const media = cover?.getBoundingClientRect();
          return {
            inset: media ? media.left - box.left : -1,
            top: media ? media.top - box.top : -1,
          };
        });
        expect(geometry.inset).toBeGreaterThanOrEqual(8);
        expect(geometry.top).toBeGreaterThanOrEqual(46);
      }
    }

    await page.goto(`/${locale}/projects`);
    const domain = page.locator('.projects-filters a[href*="domain="]').first();
    await expect(domain).toBeVisible();
    await domain.click();
    await expect(page).toHaveURL(/domain=/);
    await expect(page.locator('.projects-results .redesign-case-card').first()).toBeVisible();
    await page.reload();
    await expect(page).toHaveURL(/domain=/);
    await expect(page.locator('.projects-results .redesign-case-card').first()).toBeVisible();
    await page.goto(`/${locale}/projects?domain=no-such-domain`);
    await expect(page.locator('.projects-results .redesign-case-card')).toHaveCount(0);
    for (const theme of themes)
      for (const width of widths) {
        await capture(page, { route: 'projects', locale, state: 'empty', theme, width });
      }

    await page.goto(`/${locale}/notes`);
    await page.getByRole('searchbox').fill('no-such-note-r3-05');
    await expect(page).toHaveURL(/q=no-such-note-r3-05/);
    await expect(
      page.getByText(locale === 'en' ? /No results for/ : /Không có kết quả cho/),
    ).toBeVisible();
    await page.reload();
    await expect(
      page.getByText(locale === 'en' ? /No results for/ : /Không có kết quả cho/),
    ).toBeVisible();
    for (const theme of themes)
      for (const width of widths) {
        await capture(page, { route: 'notes', locale, state: 'empty', theme, width });
      }

    await page.goto(`/${locale}/contact`);
    await page.locator('form').getByRole('button').last().click();
    await expect(page.locator('#name')).toBeFocused();
    await expect(page.locator('#name')).toHaveAttribute('aria-invalid', 'true');
    for (const theme of themes)
      for (const width of widths) {
        await capture(page, { route: 'contact', locale, state: 'inline-form-error', theme, width });
      }
    await page.locator('#name').fill(E2E_VISITOR.name);
    await page.locator('#email').fill(E2E_VISITOR.email);
    await page.locator('#topic').selectOption({ index: 1 });
    await page.locator('#message').fill('I would like to discuss a project.');
    await page.locator('form').getByRole('button').last().click();
    await expect(page.getByText(locale === 'en' ? 'Message sent' : 'Đã gửi')).toBeVisible();
    for (const theme of themes)
      for (const width of widths) {
        await capture(page, { route: 'contact', locale, state: 'success', theme, width });
      }

    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto(`/${locale}`);
    await page.keyboard.press('Tab');
    await expect(
      page.getByRole('link', { name: locale === 'en' ? 'Skip to content' : 'Bỏ qua đến nội dung' }),
    ).toBeFocused();
    await page
      .getByRole('banner')
      .getByRole('link', { name: locale === 'en' ? 'Craft' : 'Thử nghiệm' })
      .click();
    await expect(page).toHaveURL(new RegExp(`/${locale}/craft$`));
    await page.setViewportSize({ width: 390, height: 844 });
    for (const button of await page.getByRole('banner').getByRole('button').all()) {
      if (!(await button.isVisible())) continue;
      const box = await button.boundingBox();
      expect(box?.height ?? 0).toBeGreaterThanOrEqual(44);
      expect(box?.width ?? 0).toBeGreaterThanOrEqual(44);
    }
    await page.emulateMedia({ reducedMotion: 'reduce' });
    expect(
      await page
        .locator('.craft-orbit-one')
        .evaluate((node) => getComputedStyle(node).animationName),
    ).toBe('none');
    await page.emulateMedia({ reducedMotion: 'no-preference' });
  }
  expect(errors.filter((message) => !message.includes('favicon'))).toEqual([]);
});
