import { expect, test, type Page } from '@playwright/test';

import { signIn } from './helpers/auth';

test.use({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true });

const bottomBar = (page: Page) => page.getByRole('navigation', { name: 'Sections' });

test('topbar is compact and each admin section is one tap away at 390px', async ({ page }) => {
  test.setTimeout(120_000);
  await signIn(page);

  const topbar = page.locator('.admin-topbar');
  await expect(topbar.getByRole('button', { name: 'Account' })).toBeVisible();
  await expect(topbar).not.toContainText('Menu', { useInnerText: true });
  await expect(topbar).not.toContainText('⌘', { useInnerText: true });
  await expect(topbar.getByRole('button', { name: /Jump to/ })).toHaveCount(0);

  const projects = await page.request.get('/api/admin/projects');
  expect(projects.ok()).toBeTruthy();
  const { items } = (await projects.json()) as { items: Array<{ id: number }> };
  await page.goto(`/admin/projects/${items[0]!.id}`);
  await expect(topbar.getByRole('link', { name: 'Back to Projects' })).toHaveAttribute(
    'href',
    '/admin/projects',
  );
  await expect(topbar.locator('[data-slot="save-status"]')).toHaveText(/^Saved \d{2}:\d{2}$/);

  await page.goto('/admin/site');
  const bar = bottomBar(page);
  for (const [name, path] of [
    [/^Overview$/, '/admin'],
    [/^Content$/, '/admin/projects'],
    [/Inbox$/, '/admin/inbox'],
  ] as const) {
    const link = bar.getByRole('link', { name });
    await link.tap();
    await expect(page).toHaveURL((url) => url.pathname === path);
    await expect(link).toHaveAttribute('aria-current', 'page');
  }

  await bar.getByRole('button', { name: 'More' }).tap();
  const sheet = page.getByRole('dialog', { name: 'More' });
  await expect(sheet.getByRole('link', { name: 'Posts' })).toBeVisible();
  await sheet.getByRole('link', { name: 'Site settings' }).tap();
  await expect(page).toHaveURL((url) => url.pathname === '/admin/site');
  await expect(sheet).toHaveCount(0);
});

test('bottom bar pads the safe area and hides while the keyboard is open', async ({ page }) => {
  await page.addInitScript(() => {
    const viewport = Object.assign(new EventTarget(), { offsetTop: 0 });
    Object.defineProperty(viewport, 'height', {
      get: () => window.innerHeight - (document.documentElement.dataset.keyboard ? 300 : 0),
    });
    Object.defineProperty(window, 'visualViewport', { configurable: true, value: viewport });
  });
  await signIn(page);

  await expect(page.locator('meta[name="viewport"]')).toHaveAttribute(
    'content',
    /viewport-fit=cover/,
  );
  const bar = bottomBar(page);
  await expect(bar).toBeVisible();
  const paddings = await bar.evaluate((element) => {
    const found: string[] = [];
    const visit = (rules: CSSRuleList) => {
      for (const rule of Array.from(rules)) {
        if (rule instanceof CSSStyleRule && element.matches(rule.selectorText)) {
          found.push(rule.style.paddingBottom);
        } else if ('cssRules' in rule) {
          visit((rule as CSSGroupingRule).cssRules);
        }
      }
    };
    for (const sheet of Array.from(document.styleSheets)) visit(sheet.cssRules);
    return found;
  });
  expect(paddings.join(' ')).toContain('env(safe-area-inset-bottom)');

  const setKeyboard = (open: boolean) =>
    page.evaluate((value) => {
      if (value) document.documentElement.dataset.keyboard = 'open';
      else delete document.documentElement.dataset.keyboard;
      window.visualViewport!.dispatchEvent(new Event('resize'));
    }, open);
  await setKeyboard(true);
  await expect(bar).toBeHidden();
  await setKeyboard(false);
  await expect(bar).toBeVisible();
});
