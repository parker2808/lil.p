import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

import { expect, test, type Page } from '@playwright/test';

import { signIn } from './helpers/auth';

const OUTPUT = join(process.env.HOME ?? '/tmp', 'Desktop/lilp-admin-demo-20261102');
type Locale = 'en' | 'vi';
type Capture = {
  route: string;
  locale: Locale;
  pageLocale?: Locale;
  state: string;
  theme: string;
  width: number;
  file: string;
};

async function capture(
  page: Page,
  entries: Capture[],
  route: string,
  locale: Locale,
  state: string,
  pageLocale?: Locale,
) {
  await mkdir(OUTPUT, { recursive: true });
  for (const theme of ['light', 'dark'] as const) {
    await page.setViewportSize({ width: 1440, height: 900 });
    const html = page.locator('html');
    if (!(await html.evaluate((element, next) => element.classList.contains(next), theme))) {
      await page
        .locator(
          `header button[aria-label="${locale === 'en' ? 'Toggle theme' : 'Đổi giao diện'}"]`,
        )
        .evaluate((button: HTMLButtonElement) => button.click());
    }
    await expect(page.locator('html')).toHaveClass(new RegExp(`\\b${theme}\\b`));
    await expect(page.locator('html')).toHaveAttribute('lang', locale);
    for (const width of [1440, 390]) {
      await page.setViewportSize({ width, height: 900 });
      expect(
        await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1),
      ).toBe(true);
      const file = `${route}-${locale}-${pageLocale ? `page-${pageLocale}-` : ''}${state}-${theme}-${width}.png`;
      await page.screenshot({
        path: join(OUTPUT, file),
        animations: 'disabled',
        style:
          'input[type=email],#contactEmail,#phone,a[href^="mailto:"]{visibility:hidden!important}',
      });
      entries.push({ route, locale, pageLocale, state, theme, width, file });
    }
  }
}

async function saveManifest(name: string, entries: Capture[]) {
  await writeFile(join(OUTPUT, `manifest-r3-10-${name}.json`), JSON.stringify(entries, null, 2));
}

async function captureFetchStates(
  page: Page,
  entries: Capture[],
  routeName: string,
  locale: Locale,
  requestPattern: RegExp,
  loadingText: string | null,
  errorText: string,
  readySelector: string,
) {
  let releaseLoading: () => void = () => undefined;
  const loadingGate = new Promise<void>((resolve) => {
    releaseLoading = resolve;
  });
  await page.route(requestPattern, async (route) => {
    await loadingGate;
    await route.continue();
  });
  await page.reload();
  if (loadingText) {
    await expect(page.getByText(loadingText)).toBeVisible();
  } else {
    await expect(page.locator('[data-slot="page-skeleton"]')).toBeVisible();
  }
  await capture(page, entries, routeName, locale, 'loading');
  releaseLoading();
  await expect(page.locator(readySelector)).toBeVisible();
  await page.unroute(requestPattern);

  await page.route(requestPattern, (route) =>
    route.fulfill({ status: 404, contentType: 'application/json', body: '{"code":"NOT_FOUND"}' }),
  );
  await page.reload();
  await expect(page.getByText(errorText)).toBeVisible();
  await capture(page, entries, routeName, locale, 'error');
  await page.unroute(requestPattern);
}

for (const uiLocale of ['en', 'vi'] as const) {
  for (const pageLocale of ['en', 'vi'] as const) {
    test(`custom page publish guard in ${uiLocale} UI and ${pageLocale} page`, async ({ page }) => {
      test.setTimeout(300_000);
      const entries: Capture[] = [];
      await signIn(page);
      if (uiLocale === 'vi') {
        await page.getByRole('combobox', { name: 'Language' }).click();
        await page.getByRole('option', { name: 'VI' }).click();
        await expect(page.locator('html')).toHaveAttribute('lang', 'vi');
      }
      const origin = new URL(page.url()).origin;
      const key = `r3editor-${uiLocale}-${pageLocale}-${Date.now()}`;
      const created = await page.request.post('/api/admin/pages', {
        headers: { Origin: origin },
        data: {
          key,
          title: pageLocale === 'en' ? 'Studio notes' : 'Ghi chú xưởng',
          locale: pageLocale,
          template: 'starter',
        },
      });
      expect(created.status()).toBe(201);
      const draft = (await created.json()) as {
        blocks: Array<{ id: number; type: string; updatedAt: string; props: unknown }>;
      };
      const prose = draft.blocks.find((block) => block.type === 'prose');
      expect(prose).toBeTruthy();

      await page.goto(`/admin/pages/${key}`);
      await expect(page.locator('[data-slot="editor-shell"]')).toBeVisible();
      await expect(
        page.getByRole('heading', {
          name: new RegExp(pageLocale === 'en' ? 'Studio notes' : 'Ghi chú xưởng'),
        }),
      ).toBeVisible();
      await expect(page.locator('iframe[title]')).toHaveAttribute('src', new RegExp('/api/draft'));
      await capture(page, entries, 'pages-custom', uiLocale, 'draft', pageLocale);

      const publish = page.getByRole('button', {
        name: uiLocale === 'en' ? 'Publish' : 'Xuất bản',
        exact: true,
      });
      for (const state of ['untouched', 'hidden', 'deleted'] as const) {
        if (state === 'hidden') {
          const response = await page.request.patch(`/api/admin/pages/${key}/blocks/${prose!.id}`, {
            headers: { Origin: origin },
            data: { isVisible: false, updatedAt: prose!.updatedAt },
          });
          expect(response.ok()).toBe(true);
          await page.reload();
        }
        if (state === 'deleted') {
          const response = await page.request.delete(
            `/api/admin/pages/${key}/blocks/${prose!.id}`,
            { headers: { Origin: origin } },
          );
          expect(response.ok()).toBe(true);
          await page.reload();
        }
        await publish.click();
        const alert = page.locator('[role="alert"][data-field-path="body"]');
        await expect(alert).toBeVisible();
        await expect(alert.getByRole('link')).toHaveAttribute('href', '#page-body-editor');
        if (uiLocale === 'vi') await expect(alert).not.toContainText('Validation failed');
        await capture(page, entries, 'pages-custom', uiLocale, state, pageLocale);
      }

      const added = await page.request.post(`/api/admin/pages/${key}/blocks`, {
        headers: { Origin: origin },
        data: { type: 'prose' },
      });
      expect(added.status()).toBe(201);
      const newProse = (await added.json()) as { id: number; updatedAt: string };
      const updated = await page.request.patch(`/api/admin/pages/${key}/blocks/${newProse.id}`, {
        headers: { Origin: origin },
        data: {
          props: {
            body: {
              en: 'This studio note explains the design decisions in detail.',
              vi: 'Ghi chú này giải thích những quyết định thiết kế một cách chi tiết.',
            },
          },
          updatedAt: newProse.updatedAt,
        },
      });
      expect(updated.ok()).toBe(true);
      await page.reload();
      await publish.click();
      await expect(
        page.getByText(uiLocale === 'en' ? /Published v1/ : /Đã xuất bản bản 1/).first(),
      ).toBeVisible();
      await capture(page, entries, 'pages-custom', uiLocale, 'published', pageLocale);
      const discard = page.getByRole('button', {
        name: uiLocale === 'en' ? 'Discard changes' : 'Bỏ thay đổi',
      });
      await discard.click();
      await expect(page.getByRole('alertdialog')).toBeVisible();
      await capture(page, entries, 'pages-custom', uiLocale, 'confirm-discard', pageLocale);
      await page.getByRole('button', { name: uiLocale === 'en' ? 'Cancel' : 'Hủy' }).click();
      await expect(page.getByRole('alertdialog')).toHaveCount(0);
      const proseRow = page.locator('[data-slot="block-row"]').filter({ hasText: 'prose' }).first();
      await proseRow
        .getByRole('button', { name: uiLocale === 'en' ? 'Block actions' : 'Thao tác với khối' })
        .click();
      await page
        .getByRole('menuitem', { name: uiLocale === 'en' ? 'Delete' : 'Xóa', exact: true })
        .click();
      await expect(page.getByRole('alertdialog')).toBeVisible();
      await capture(page, entries, 'pages-custom', uiLocale, 'confirm-delete-block', pageLocale);
      await page.getByRole('button', { name: uiLocale === 'en' ? 'Cancel' : 'Hủy' }).click();
      await expect(page.getByRole('alertdialog')).toHaveCount(0);
      await saveManifest(`${uiLocale}-page-${pageLocale}`, entries);
    });
  }

  test(`empty ${uiLocale} page needs an H1 and visible body copy`, async ({ page }) => {
    test.setTimeout(180_000);
    const entries: Capture[] = [];
    await signIn(page);
    if (uiLocale === 'vi') {
      await page.getByRole('combobox', { name: 'Language' }).click();
      await page.getByRole('option', { name: 'VI' }).click();
      await expect(page.locator('html')).toHaveAttribute('lang', 'vi');
    }
    const origin = new URL(page.url()).origin;
    const key = `r3empty-${uiLocale}-${Date.now()}`;
    const created = await page.request.post('/api/admin/pages', {
      headers: { Origin: origin },
      data: {
        key,
        title: uiLocale === 'en' ? 'Empty studio page' : 'Trang xưởng trống',
        locale: uiLocale,
        template: 'empty',
      },
    });
    expect(created.status()).toBe(201);
    await page.goto(`/admin/pages/${key}`);
    await expect(page.locator('[data-slot="editor-shell"]')).toBeVisible();
    await capture(page, entries, 'pages-empty', uiLocale, 'draft', uiLocale);
    const beforeH1 = await page.request.post(`/api/admin/pages/${key}/publish`, {
      headers: { Origin: origin },
      data: {},
    });
    expect(beforeH1.status()).not.toBe(200);
    await page.getByRole('button', { name: uiLocale === 'en' ? 'Add block' : 'Thêm khối' }).click();
    await page
      .getByRole('option', {
        name: new RegExp(uiLocale === 'en' ? 'Page header' : 'Tiêu đề trang'),
      })
      .click();
    await expect(page.locator('[data-slot="block-row"]')).toHaveCount(1);
    const current = (await (await page.request.get(`/api/admin/pages/${key}`)).json()) as {
      blocks: Array<{
        id: number;
        type: string;
        updatedAt: string;
        props: Record<string, unknown>;
      }>;
    };
    const header = current.blocks.find((block) => block.type === 'page-header');
    expect(header).toBeTruthy();
    const headerUpdated = await page.request.patch(`/api/admin/pages/${key}/blocks/${header!.id}`, {
      headers: { Origin: origin },
      data: {
        props: { ...header!.props, title: { en: 'Studio notes', vi: 'Ghi chú xưởng' } },
        updatedAt: header!.updatedAt,
      },
    });
    expect(headerUpdated.ok()).toBe(true);
    await page.reload();
    await page
      .getByRole('button', { name: uiLocale === 'en' ? 'Publish' : 'Xuất bản', exact: true })
      .click();
    await expect(page.locator('[role="alert"][data-field-path="body"]')).toBeVisible();
    await capture(page, entries, 'pages-empty', uiLocale, 'body-required', uiLocale);
    await page.getByRole('button', { name: uiLocale === 'en' ? 'Add block' : 'Thêm khối' }).click();
    await page
      .getByRole('option', { name: new RegExp(uiLocale === 'en' ? 'Prose' : 'Văn bản') })
      .click();
    await expect(page.locator('[data-slot="block-row"]')).toHaveCount(2);
    const afterAdd = (await (await page.request.get(`/api/admin/pages/${key}`)).json()) as {
      blocks: Array<{ id: number; type: string; updatedAt: string }>;
    };
    const prose = afterAdd.blocks.find((block) => block.type === 'prose');
    expect(prose).toBeTruthy();
    const proseUpdated = await page.request.patch(`/api/admin/pages/${key}/blocks/${prose!.id}`, {
      headers: { Origin: origin },
      data: {
        props: {
          body: {
            en: 'This studio note describes the creative process in detail.',
            vi: 'Ghi chú xưởng này mô tả chi tiết quá trình sáng tạo.',
          },
        },
        updatedAt: prose!.updatedAt,
      },
    });
    expect(proseUpdated.ok()).toBe(true);
    await page.reload();
    await page
      .getByRole('button', { name: uiLocale === 'en' ? 'Publish' : 'Xuất bản', exact: true })
      .click();
    await expect(
      page.getByText(uiLocale === 'en' ? /Published v1/ : /Đã xuất bản bản 1/).first(),
    ).toBeVisible();
    await capture(page, entries, 'pages-empty', uiLocale, 'published', uiLocale);
    await saveManifest(`${uiLocale}-empty-page`, entries);
  });

  test(`standalone experience create, validation and edit in ${uiLocale}`, async ({ page }) => {
    test.setTimeout(240_000);
    const entries: Capture[] = [];
    await signIn(page);
    if (uiLocale === 'vi') {
      await page.getByRole('combobox', { name: 'Language' }).click();
      await page.getByRole('option', { name: 'VI' }).click();
      await expect(page.locator('html')).toHaveAttribute('lang', 'vi');
    }
    await page.goto('/admin/experience/new');
    await expect(page.locator('[data-slot="editor-shell"]')).toBeVisible();
    await capture(page, entries, 'experience-new', uiLocale, 'normal');
    await page
      .getByRole('button', { name: uiLocale === 'en' ? 'Save role' : 'Lưu vai trò' })
      .click();
    await expect(
      page.getByLabel(uiLocale === 'en' ? 'Company' : 'Công ty', { exact: true }),
    ).toHaveAttribute('aria-invalid', 'true');
    await expect(page.getByRole('alert').first()).toBeVisible();
    await capture(page, entries, 'experience-new', uiLocale, 'validation');
    await page
      .getByLabel(uiLocale === 'en' ? 'Company' : 'Công ty', { exact: true })
      .fill('Example Studio');
    await page.getByLabel(uiLocale === 'en' ? 'Location' : 'Địa điểm').fill('Remote');
    await page.getByLabel(uiLocale === 'en' ? 'Role' : 'Vai trò', { exact: true }).fill('Designer');
    const createPattern = /\/api\/admin\/experience$/;
    await page.route(createPattern, (route) =>
      route.fulfill({ status: 500, contentType: 'application/json', body: '{"code":"FAILED"}' }),
    );
    await page
      .getByRole('button', { name: uiLocale === 'en' ? 'Save role' : 'Lưu vai trò' })
      .click();
    await expect(
      page.getByRole('alert').filter({
        hasText:
          uiLocale === 'en'
            ? 'The role could not be saved. Try again.'
            : 'Không lưu được vai trò. Hãy thử lại.',
      }),
    ).toBeVisible();
    await capture(page, entries, 'experience-new', uiLocale, 'save-error');
    await page.unroute(createPattern);
    await page
      .getByRole('button', { name: uiLocale === 'en' ? 'Save role' : 'Lưu vai trò' })
      .click();
    await expect(page).toHaveURL(/\/admin\/experience\/\d+$/);
    await capture(page, entries, 'experience-edit', uiLocale, 'saved');
    await page.reload();
    await expect(
      page.getByLabel(uiLocale === 'en' ? 'Company' : 'Công ty', { exact: true }),
    ).toHaveValue('Example Studio');
    await capture(page, entries, 'experience-edit', uiLocale, 'normal');

    let releaseLoading: () => void = () => undefined;
    const loadingGate = new Promise<void>((resolve) => {
      releaseLoading = resolve;
    });
    const detailPattern = /\/api\/admin\/experience\/\d+$/;
    await page.route(detailPattern, async (route) => {
      await loadingGate;
      await route.continue();
    });
    await page.reload();
    await expect(
      page.getByText(uiLocale === 'en' ? 'Loading experience' : 'Đang tải kinh nghiệm'),
    ).toBeVisible();
    await capture(page, entries, 'experience-edit', uiLocale, 'loading');
    releaseLoading();
    await expect(
      page.getByLabel(uiLocale === 'en' ? 'Company' : 'Công ty', { exact: true }),
    ).toHaveValue('Example Studio');
    await page.unroute(detailPattern);

    await page.route(detailPattern, (route) =>
      route.fulfill({
        status: 404,
        contentType: 'application/json',
        body: '{"code":"NOT_FOUND","message":"Missing"}',
      }),
    );
    await page.reload();
    await expect(
      page.getByText(
        uiLocale === 'en' ? 'This role could not be loaded.' : 'Không tải được vai trò này.',
      ),
    ).toBeVisible();
    await capture(page, entries, 'experience-edit', uiLocale, 'error');
    await page.unroute(detailPattern);
    await page.reload();
    await expect(
      page.getByLabel(uiLocale === 'en' ? 'Company' : 'Công ty', { exact: true }),
    ).toHaveValue('Example Studio');

    await page
      .getByRole('button', { name: uiLocale === 'en' ? 'Delete role' : 'Xóa vai trò' })
      .click();
    await expect(page.getByRole('alertdialog')).toBeVisible();
    await capture(page, entries, 'experience-edit', uiLocale, 'confirm-delete');
    await page.getByRole('button', { name: uiLocale === 'en' ? 'Cancel' : 'Hủy' }).click();
    await expect(page.getByRole('alertdialog')).toHaveCount(0);
    await saveManifest(`${uiLocale}-experience`, entries);
  });

  test(`project, post, profile and site editor saves in ${uiLocale}`, async ({ page }) => {
    test.setTimeout(300_000);
    const entries: Capture[] = [];
    await signIn(page);
    if (uiLocale === 'vi') {
      await page.getByRole('combobox', { name: 'Language' }).click();
      await page.getByRole('option', { name: 'VI' }).click();
      await expect(page.locator('html')).toHaveAttribute('lang', 'vi');
    }
    const origin = new URL(page.url()).origin;
    const slug = `r3-editor-${Date.now()}`;

    await page.goto('/admin/projects/new');
    await expect(page.locator('[data-slot="editor-shell"]')).toBeVisible();
    await capture(page, entries, 'projects-new', uiLocale, 'normal');
    await page.locator('#titleEn').focus();
    await page.locator('#titleEn').blur();
    await expect(page.locator('#titleEn')).toHaveAttribute('aria-invalid', 'true');
    await capture(page, entries, 'projects-new', uiLocale, 'validation');

    const projectResponse = await page.request.post('/api/admin/projects', {
      headers: { Origin: origin },
      data: {
        slug,
        titleEn: 'Example project',
        titleVi: 'Dự án mẫu',
        taglineEn: 'A practical case study',
        taglineVi: '',
        client: 'Example client',
        roleEn: 'Designer',
        roleVi: '',
        startDate: '2024-01-01',
        problemEn: 'A workflow needed a clearer path.',
        problemVi: '',
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
    expect(projectResponse.status()).toBe(201);
    const project = (await projectResponse.json()) as { id: number };
    await page.goto(`/admin/projects/${project.id}`);
    await expect(page.locator('[data-slot="editor-shell"]')).toBeVisible();
    await expect(
      page.getByRole('link', { name: uiLocale === 'en' ? 'Preview' : 'Xem trước' }),
    ).toHaveAttribute('href', /\/api\/draft/);
    await capture(page, entries, 'projects-edit', uiLocale, 'draft');
    await page.locator('#taglineEn').fill('A practical case study with a clear outcome');
    await page.locator('#taglineEn').blur();
    await expect
      .poll(
        async () =>
          (
            (await (await page.request.get(`/api/admin/projects/${project.id}`)).json()) as {
              taglineEn: string;
            }
          ).taglineEn,
      )
      .toBe('A practical case study with a clear outcome');
    await capture(page, entries, 'projects-edit', uiLocale, 'saved');
    await page
      .getByRole('button', { name: uiLocale === 'en' ? 'Publish' : 'Xuất bản', exact: true })
      .click();
    await expect(
      page.getByText(uiLocale === 'en' ? 'Published' : 'Đã xuất bản', { exact: true }).first(),
    ).toBeVisible();
    await capture(page, entries, 'projects-edit', uiLocale, 'published');
    await captureFetchStates(
      page,
      entries,
      'projects-edit',
      uiLocale,
      new RegExp(`/api/admin/projects/${project.id}$`),
      uiLocale === 'en' ? 'Loading project' : 'Đang tải dự án',
      uiLocale === 'en' ? 'This project could not be loaded.' : 'Không tải được dự án này.',
      '[data-slot="editor-shell"]',
    );

    const postResponse = await page.request.post('/api/admin/posts', {
      headers: { Origin: origin },
      data: {
        slug,
        titleEn: 'Example note',
        titleVi: 'Ghi chú mẫu',
        excerptEn: 'An example editorial summary.',
        excerptVi: '',
        bodyEn: 'A complete example note with useful detail.',
        bodyVi: '',
        takeawaysEn: '',
        takeawaysVi: '',
      },
    });
    expect(postResponse.status()).toBe(201);
    const post = (await postResponse.json()) as { id: number };
    await page.goto('/admin/posts/new');
    await expect(page.locator('[data-slot="editor-shell"]')).toBeVisible();
    await capture(page, entries, 'posts-new', uiLocale, 'normal');
    await page.locator('#titleEn').focus();
    await page.locator('#titleEn').blur();
    await expect(page.locator('#titleEn')).toHaveAttribute('aria-invalid', 'true');
    await capture(page, entries, 'posts-new', uiLocale, 'validation');
    await page.goto(`/admin/posts/${post.id}`);
    await expect(page.locator('[data-slot="editor-shell"]')).toBeVisible();
    await expect(
      page.getByRole('link', { name: uiLocale === 'en' ? 'Preview' : 'Xem trước' }),
    ).toHaveAttribute('href', /\/api\/draft/);
    await capture(page, entries, 'posts-edit', uiLocale, 'draft');
    await page.locator('#excerptEn').fill('An example editorial summary with an update.');
    await page.locator('#excerptEn').blur();
    await expect
      .poll(
        async () =>
          (
            (await (await page.request.get(`/api/admin/posts/${post.id}`)).json()) as {
              excerptEn: string;
            }
          ).excerptEn,
      )
      .toBe('An example editorial summary with an update.');
    await capture(page, entries, 'posts-edit', uiLocale, 'saved');
    await page
      .getByRole('button', { name: uiLocale === 'en' ? 'Publish' : 'Xuất bản', exact: true })
      .click();
    await expect(
      page.getByText(uiLocale === 'en' ? 'Published' : 'Đã xuất bản', { exact: true }).first(),
    ).toBeVisible();
    await capture(page, entries, 'posts-edit', uiLocale, 'published');
    await captureFetchStates(
      page,
      entries,
      'posts-edit',
      uiLocale,
      new RegExp(`/api/admin/posts/${post.id}$`),
      uiLocale === 'en' ? 'Loading post' : 'Đang tải bài viết',
      uiLocale === 'en' ? 'This post could not be loaded.' : 'Không tải được bài viết này.',
      '[data-slot="editor-shell"]',
    );

    await page.goto('/admin/profile');
    await expect(page.locator('[data-slot="editor-shell"]')).toBeVisible();
    await capture(page, entries, 'profile', uiLocale, 'normal');
    const headline = await page.locator('#headlineEn').inputValue();
    await page.locator('#headlineEn').fill(`${headline} updated`);
    await page.locator('#headlineEn').blur();
    await expect
      .poll(
        async () =>
          ((await (await page.request.get('/api/admin/profile')).json()) as { headlineEn: string })
            .headlineEn,
      )
      .toBe(`${headline} updated`);
    await capture(page, entries, 'profile', uiLocale, 'saved');
    await captureFetchStates(
      page,
      entries,
      'profile',
      uiLocale,
      /\/api\/admin\/profile$/,
      null,
      uiLocale === 'en' ? 'The profile could not be loaded.' : 'Không tải được hồ sơ.',
      '[data-slot="editor-shell"]',
    );

    await page.goto('/admin/site');
    await expect(page.locator('#siteName')).toBeVisible();
    await capture(page, entries, 'site', uiLocale, 'normal');
    const siteName = await page.locator('#siteName').inputValue();
    await page.locator('#siteName').fill(`${siteName} Studio`);
    await page
      .getByRole('button', { name: uiLocale === 'en' ? 'Save' : 'Lưu', exact: true })
      .click();
    await expect
      .poll(
        async () =>
          ((await (await page.request.get('/api/admin/site')).json()) as { siteName: string })
            .siteName,
      )
      .toBe(`${siteName} Studio`);
    await capture(page, entries, 'site', uiLocale, 'saved');
    await captureFetchStates(
      page,
      entries,
      'site',
      uiLocale,
      /\/api\/admin\/site$/,
      uiLocale === 'en' ? 'Loading site settings' : 'Đang tải cài đặt trang web',
      uiLocale === 'en'
        ? 'Site settings could not be loaded.'
        : 'Không tải được cài đặt trang web.',
      '#siteName',
    );
    await saveManifest(`${uiLocale}-other-editors`, entries);
  });
}
