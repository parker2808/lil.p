import { createHash } from 'node:crypto';
import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';

import { signIn } from './helpers/auth';
import { E2E_USER } from './helpers/credentials';

const output = process.env.U0_CAPTURE_DIR;
const auditOutput = process.env.U2_AUDIT_DIR;
const locales = ['en', 'vi'] as const;
const themes = ['light', 'dark'] as const;
const widths = [1440, 390] as const;
const publicRoutes = [
  '',
  '/about',
  '/contact',
  '/craft',
  '/notes',
  '/notes/vue-to-react',
  '/projects',
  '/projects/particula',
  '/studio-notes',
];
const adminRoutes = [
  '/admin',
  '/admin/analytics',
  '/admin/audit',
  '/admin/experience/new',
  '/admin/inbox',
  '/admin/media',
  '/admin/pages',
  '/admin/pages/home',
  '/admin/pages/about',
  '/admin/pages/contact',
  '/admin/pages/studio-notes',
  '/admin/posts',
  '/admin/posts/new',
  '/admin/profile',
  '/admin/projects',
  '/admin/projects/new',
  '/admin/site',
  '/admin/users',
];
const resourceRoutes = [
  ['experience', '/admin/experience/'],
  ['posts', '/admin/posts/'],
  ['projects', '/admin/projects/'],
  ['messages', '/admin/inbox/'],
] as const;

type Capture = {
  route: string;
  locale: string;
  theme: string;
  width: number;
  file: string;
  sha256: string;
};

type AuditIssue = {
  route: string;
  locale: string;
  theme: string;
  width: number;
  kind: string;
  target: string;
  detail: string;
};

const auditIssues: AuditIssue[] = [];

async function audit(page: Page, route: string, locale: string, theme: string, width: number) {
  const violations = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
    .analyze();
  for (const violation of violations.violations) {
    for (const node of violation.nodes) {
      auditIssues.push({
        route,
        locale,
        theme,
        width,
        kind: violation.id,
        target: node.target.join(' '),
        detail: node.failureSummary ?? violation.help,
      });
    }
  }
  const targets = await page.evaluate(() =>
    Array.from(
      document.querySelectorAll<HTMLElement>(
        'a[href],button,input:not([type="hidden"]),select,textarea,[role="button"],[role="checkbox"],[role="switch"],[role="radio"],[role="tab"],[role="combobox"]',
      ),
    )
      .filter((element) => {
        const style = getComputedStyle(element);
        return (
          style.display !== 'none' &&
          style.visibility !== 'hidden' &&
          style.pointerEvents !== 'none' &&
          style.clipPath !== 'inset(50%)' &&
          !element.closest('[aria-hidden="true"]') &&
          element.getClientRects().length > 0
        );
      })
      .map((element) => {
        const overlay = getComputedStyle(element, '::after');
        const card = element.closest<HTMLElement>('.group.relative');
        const box =
          card && overlay.position === 'absolute' && overlay.inset === '0px'
            ? card.getBoundingClientRect()
            : element.getBoundingClientRect();
        return {
          target: `${element.tagName.toLowerCase()}${element.id ? `#${element.id}` : ''}${element.getAttribute('role') ? `[role=${element.getAttribute('role')}]` : ''}${element.getAttribute('data-slot') ? `[data-slot=${element.getAttribute('data-slot')}]` : ''}${element.classList.length ? `.${Array.from(element.classList).slice(0, 2).join('.')}` : ''}${element.parentElement?.closest('[data-slot]')?.getAttribute('data-slot') ? ` @${element.parentElement.closest('[data-slot]')?.getAttribute('data-slot')}` : ''}`,
          width: box.width,
          height: box.height,
        };
      })
      .filter((target) => target.width < 44 || target.height < 44),
  );
  for (const target of targets) {
    auditIssues.push({
      route,
      locale,
      theme,
      width,
      kind: 'target-size-44',
      target: target.target,
      detail: `${Math.round(target.width)}×${Math.round(target.height)}px`,
    });
  }
}

async function capture(page: Page, route: string, locale: string, results: Capture[]) {
  await page.goto(route);
  await expect(page.locator('main#content')).toBeVisible();
  await expect(page.locator('html')).toHaveAttribute('lang', locale);
  for (const theme of themes) {
    await page.evaluate((value) => localStorage.setItem('theme', value), theme);
    await page.reload();
    await expect(page.locator('html')).toHaveClass(new RegExp(`(?:^|\\s)${theme}(?:\\s|$)`));
    for (const width of widths) {
      await page.setViewportSize({ width, height: width === 390 ? 844 : 900 });
      await expect(page.locator('main#content')).toBeVisible();
      const file = `${route.replaceAll('/', '_') || 'home'}-${locale}-${theme}-${width}.png`;
      const bytes = await page.screenshot({
        path: join(output!, file),
        fullPage: true,
        animations: 'disabled',
        style: 'input[type=email],a[href^="mailto:"]{visibility:hidden!important}',
      });
      results.push({
        route,
        locale,
        theme,
        width,
        file,
        sha256: createHash('sha256').update(bytes).digest('hex'),
      });
      if (auditOutput) await audit(page, route, locale, theme, width);
    }
  }
}

test('U0 pre-change route screenshots', async ({ browser, page }) => {
  test.skip(!output, 'Opt-in only: set U0_CAPTURE_DIR to a local path outside the repo');
  test.setTimeout(auditOutput ? 3_600_000 : 1_200_000);
  await mkdir(output!, { recursive: true });
  const results: Capture[] = [];
  const failures: Array<{ route: string; locale: string; reason: string }> = [];
  const captureRoute = async (target: Page, route: string, locale: string) => {
    try {
      await capture(target, route, locale, results);
    } catch (error) {
      failures.push({ route, locale, reason: String(error).slice(0, 300) });
    }
  };

  for (const locale of locales) {
    await page.goto('/admin/login');
    await page
      .context()
      .addCookies([{ name: 'NEXT_LOCALE', value: locale, url: new URL(page.url()).origin }]);
    await captureRoute(page, '/admin/login', locale);
  }
  await page
    .context()
    .addCookies([{ name: 'NEXT_LOCALE', value: 'en', url: new URL(page.url()).origin }]);
  await signIn(page);
  const origin = new URL(page.url()).origin;
  const created = await page.request.post('/api/admin/pages', {
    headers: { Origin: origin },
    data: { title: 'Studio notes', key: 'studio-notes', locale: 'en', template: 'starter' },
  });
  expect(created.status()).toBe(201);
  const draft = (await created.json()) as { blocks: Array<{ id: number; type: string }> };
  const prose = draft.blocks.find((block) => block.type === 'prose');
  expect(prose).toBeDefined();
  expect(
    (
      await page.request.patch(`/api/admin/pages/studio-notes/blocks/${prose!.id}`, {
        headers: { Origin: origin },
        data: { props: { body: { en: 'Studio overview', vi: 'Giới thiệu studio' } } },
      })
    ).ok(),
  ).toBe(true);
  expect(
    (
      await page.request.post('/api/admin/pages/studio-notes/publish', {
        headers: { Origin: origin },
        data: {},
      })
    ).ok(),
  ).toBe(true);

  const message = await page.request.post('/api/public/contact', {
    headers: { Origin: origin },
    data: {
      name: 'U0 Visitor',
      email: E2E_USER.email,
      message: 'U0 screenshot fixture',
      locale: 'en',
    },
  });
  expect(message.ok()).toBe(true);

  for (const [resource, prefix] of resourceRoutes) {
    const response = await page.request.get(`/api/admin/${resource}`);
    expect(response.ok(), resource).toBe(true);
    const listing = (await response.json()) as { items: Array<{ id: number }> };
    expect(listing.items.length, resource).toBeGreaterThan(0);
    adminRoutes.push(`${prefix}${listing.items[0]!.id}`);
  }

  const publicContext = await browser.newContext();
  const publicPage = await publicContext.newPage();
  try {
    for (const locale of locales) {
      await page.context().addCookies([{ name: 'NEXT_LOCALE', value: locale, url: origin }]);
      await publicPage.goto(`/${locale}`);
      await publicContext.addCookies([{ name: 'NEXT_LOCALE', value: locale, url: origin }]);
      for (const route of adminRoutes) await captureRoute(page, route, locale);
      for (const suffix of publicRoutes)
        await captureRoute(publicPage, `/${locale}${suffix}`, locale);
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
          await captureRoute(publicPage, `/${locale}/r3-loading-test/${variant}`, locale);
        }
        await captureRoute(publicPage, `/${locale}/r3-site-error-test`, locale);
        await captureRoute(publicPage, `/${locale}/r3-locale-error-test`, locale);
      }
    }
  } finally {
    await publicContext.close();
    if (auditOutput) {
      await mkdir(auditOutput, { recursive: true });
      await writeFile(join(auditOutput, 'issues.json'), JSON.stringify(auditIssues, null, 2));
    }
    await writeFile(
      join(output!, 'manifest.json'),
      JSON.stringify(
        {
          baseline: process.env.U0_CAPTURE_BASELINE ?? 'd0d474b',
          flag: process.env.R3_E2E_STATES === '1' ? 'R3_E2E_STATES=1' : 'off',
          generatedAt: new Date().toISOString(),
          captures: results,
          failures,
          excluded: [
            'Redirect-only routes: seven About tabs, two legacy experience editors, admin tags',
            'Unknown-path 404s: not normal reachable pages',
            'Test-only error/loading pages require R3_E2E_STATES=1 at build and runtime',
          ],
        },
        null,
        2,
      ),
    );
  }
  expect(failures, 'Capture failures (see manifest)').toEqual([]);
  if (auditOutput) expect(auditIssues, 'WCAG AA and 44px issues (see issues.json)').toEqual([]);
});
