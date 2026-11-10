import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

import { expect, test, type Page } from '@playwright/test';

import { signIn } from './helpers/auth';
import { expectNoSeriousAxeIssues } from './helpers/axe';

const captureDir = process.env.R3_CAPTURE_DIR;
const sizes = [1440, 390] as const;
const themes = ['light', 'dark'] as const;
type Capture = {
  route: string;
  locale: string;
  state: string;
  theme: string;
  width: number;
  file: string;
};

async function capture(page: Page, tuple: Omit<Capture, 'file'>) {
  await page.setViewportSize({ width: tuple.width, height: tuple.width === 390 ? 844 : 900 });
  const localeSuggestion = page.locator('.locale-toast button');
  if (await localeSuggestion.isVisible()) await localeSuggestion.click();
  await page.evaluate((theme) => {
    localStorage.setItem('theme', theme);
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, tuple.theme);
  if (tuple.state === 'loading')
    await expect(page.locator('[aria-busy="true"]').first()).toBeVisible();
  else await expect(page.locator('h1').first()).toBeVisible();
  expect(
    await page.evaluate(() => document.documentElement.scrollWidth - innerWidth),
  ).toBeLessThanOrEqual(1);
  if (!captureDir) return;
  await mkdir(captureDir, { recursive: true });
  const file = `${tuple.route}-${tuple.locale}-${tuple.state}-${tuple.theme}-${tuple.width}.png`;
  await page.screenshot({ path: join(captureDir, file), fullPage: true, animations: 'disabled' });
  const manifestPath = join(captureDir, 'r3-07-manifest.json');
  let previous: Capture[] = [];
  try {
    previous = JSON.parse(await readFile(manifestPath, 'utf8')) as Capture[];
  } catch {
    /* first capture */
  }
  await writeFile(
    manifestPath,
    JSON.stringify(
      [...previous.filter((entry) => entry.file !== file), { ...tuple, file }].sort((a, b) =>
        a.file.localeCompare(b.file),
      ),
      null,
      2,
    ),
  );
}

async function matrix(page: Page, route: string, locale: string, state: string) {
  for (const theme of themes)
    for (const width of sizes) await capture(page, { route, locale, state, theme, width });
}

test('authorized project and note draft previews in EN/VI', async ({ page }) => {
  test.setTimeout(120_000);
  await signIn(page);
  const slug = 'r3-07-draft-case';
  const created = await page.request.post('/api/admin/projects', {
    headers: { Origin: new URL(page.url()).origin },
    data: {
      slug,
      titleEn: 'R3 draft case',
      titleVi: 'Hồ sơ nháp R3',
      taglineEn: 'Draft preview check',
      taglineVi: 'Kiểm tra bản xem trước',
      client: 'Example',
      roleEn: 'Frontend engineer',
      roleVi: 'Kỹ sư giao diện',
      startDate: '2024-01-01',
      problemEn: 'A draft visible only to an authorized editor.',
      problemVi: 'Bản nháp chỉ dành cho biên tập viên.',
      constraintsEn: '',
      constraintsVi: '',
      approachEn: '',
      approachVi: '',
      decisionsEn: '',
      decisionsVi: '',
      outcomeEn: '',
      outcomeVi: '',
      lessonsEn: '',
      lessonsVi: '',
      keyFactsEn: '',
      keyFactsVi: '',
      factChipsEn: '',
      factChipsVi: '',
    },
  });
  expect(created.status()).toBe(201);

  for (const locale of ['en', 'vi'] as const) {
    await page.goto(`/${locale}/projects/${slug}`);
    await expect(
      page.getByRole('heading', {
        level: 1,
        name: locale === 'en' ? 'This page is missing' : 'Không tìm thấy trang này',
      }),
    ).toBeVisible();
    await matrix(page, 'project-detail', locale, 'draft-404');
  }

  for (const locale of ['en', 'vi'] as const) {
    await page.goto(`/api/draft?path=/${locale}/projects/${slug}`);
    await expect(
      page.getByRole('heading', {
        level: 1,
        name: locale === 'en' ? 'R3 draft case' : 'Hồ sơ nháp R3',
      }),
    ).toBeVisible();
    await matrix(page, 'project-detail', locale, 'preview');
    await page.goto(`/api/draft?path=/${locale}/notes/draft-note`);
    const cookieNames = (await page.context().cookies(page.url())).map((cookie) => cookie.name);
    expect(cookieNames, `draft cookies after ${page.url()}`).toContain('__prerender_bypass');
    await expect(page.locator('[data-slot="draft-banner"]')).toBeVisible();
    await expect(
      page.getByRole('heading', {
        level: 1,
        name: locale === 'en' ? 'Draft note' : 'Ghi chú nháp',
      }),
    ).toBeVisible();
    await matrix(page, 'note-detail', locale, 'preview');
  }
});

test('real detail content, SEO, public denial and states in EN/VI', async ({ page }) => {
  test.setTimeout(600_000);
  const diagnostics: string[] = [];
  page.on('pageerror', (error) => diagnostics.push(error.message));

  for (const locale of ['en', 'vi'] as const) {
    for (const [kind, slug, route] of [
      ['projects', 'particula', 'project-detail'],
      ['notes', 'vue-to-react', 'note-detail'],
    ] as const) {
      const endpoint = kind === 'notes' ? 'posts' : kind;
      const response = await page.request.get(
        `${process.env.API_URL}/api/public/${endpoint}/${slug}?locale=${locale}`,
      );
      expect(response.ok(), `${kind}/${slug} ${locale}: HTTP ${response.status()}`).toBeTruthy();
      const cms = (await response.json()) as { title: string; problem?: string; body?: string };
      await page.goto(`/${locale}/${kind}/${slug}`);
      await expect(page.getByRole('heading', { level: 1, name: cms.title })).toBeVisible();
      await expect(page).toHaveTitle(new RegExp(cms.title.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
      await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
        'href',
        new RegExp(`/${locale}/${kind}/${slug}$`),
      );
      await expect(page.locator('meta[property="og:type"]')).toHaveAttribute('content', 'article');
      await expect(
        page.locator(kind === 'notes' ? '.public-note-detail' : '.public-project-detail'),
      ).toBeVisible();
      const firstBodyLine = (kind === 'notes' ? cms.body : cms.problem)?.split('\n')[0];
      if (firstBodyLine) {
        await expect(
          page.locator(kind === 'notes' ? '#reader-content' : '.case-study-body'),
        ).toContainText(firstBodyLine);
      }
      await expectNoSeriousAxeIssues(page);
      await matrix(page, route, locale, 'normal');
    }

    await page.goto(`/${locale}/notes/draft-note`);
    await expect(
      page.getByRole('heading', {
        name: locale === 'en' ? 'This page is missing' : 'Không tìm thấy trang này',
      }),
    ).toBeVisible();
    await expect(
      page.getByRole('button', {
        name: locale === 'en' ? 'Search projects, notes and pages' : 'Tìm dự án, ghi chép và trang',
      }),
    ).toBeVisible();
    await matrix(page, 'note-detail', locale, 'draft-404');

    await page.goto(`/${locale}/missing-r3-07`);
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    await page.keyboard.press('Tab');
    await expect(
      page.getByRole('link', {
        name: locale === 'en' ? 'Skip to content' : 'Bỏ qua đến nội dung',
      }),
    ).toBeFocused();
    await expectNoSeriousAxeIssues(page);
    await matrix(page, 'not-found', locale, 'normal');

    if (process.env.R3_E2E_STATES === '1') {
      for (const variant of [
        'home',
        'projects',
        'notes',
        'about',
        'contact',
        'craft',
        'project',
        'note',
      ]) {
        await page.goto(`/${locale}/r3-loading-test/${variant}`);
        await expect(page).toHaveTitle(/lil\.parker/);
        await expect(page.locator('[aria-busy="true"]').first()).toBeVisible();
        await matrix(
          page,
          variant === 'project' ? 'project-detail' : variant === 'note' ? 'note-detail' : variant,
          locale,
          'loading',
        );
      }
      await page.goto(`/${locale}/r3-site-error-test`);
      await expect(page).toHaveTitle(/lil\.parker/);
      const retry = page.getByRole('button', { name: locale === 'en' ? 'Retry' : 'Thử lại' });
      await expect(retry).toBeVisible();
      await expectNoSeriousAxeIssues(page);
      await retry.focus();
      await page.keyboard.press('Tab');
      await expect(
        page.getByRole('link', { name: locale === 'en' ? 'Home' : 'Trang chủ' }).last(),
      ).toBeFocused();
      await matrix(page, 'site-error', locale, 'error');
      await page.goto(`/${locale}/r3-locale-error-test`);
      await expect(page).toHaveTitle(/lil\.parker/);
      await expect(retry).toBeVisible();
      await expectNoSeriousAxeIssues(page);
      await matrix(page, 'locale-error', locale, 'error');
    }
  }

  expect(diagnostics.filter((item) => !item.includes('R3 ') && !item.includes('favicon'))).toEqual(
    [],
  );
});
