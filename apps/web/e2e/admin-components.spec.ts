import { expect, type Locator, type Page, test } from '@playwright/test';

import { signIn } from './helpers/auth';

const PROPERTIES = [
  'height',
  'font-size',
  'font-weight',
  'color',
  'background-color',
  'padding-left',
  'padding-right',
  'border-radius',
  'border-left-width',
  'border-left-color',
];

async function styleOf(locator: Locator, extra: string[] = []) {
  await expect(locator).toBeVisible();
  return locator.evaluate(
    (element, names) => {
      const style = getComputedStyle(element);
      return Object.fromEntries(names.map((name) => [name, style.getPropertyValue(name)]));
    },
    [...PROPERTIES, ...extra],
  );
}

async function chromeStyles(page: Page) {
  const sidebar = page.locator('aside[data-collapsed]');
  return {
    collapse: await styleOf(page.getByRole('button', { name: 'Collapse sidebar' }), ['width']),
    inbox: await styleOf(page.locator('header').getByRole('link', { name: /^Inbox/ })),
    palette: await styleOf(page.getByRole('button', { name: /^Jump to/ })),
    account: await styleOf(page.getByRole('button', { name: /E2E Admin/ })),
    language: await styleOf(page.getByRole('combobox', { name: 'Language' })),
    activeNav: await styleOf(sidebar.locator('a[aria-current="page"]')),
    idleNav: await styleOf(sidebar.locator('a:not([aria-current])').first()),
  };
}

function snapshot(value: unknown) {
  return `${JSON.stringify(value, null, 2)}\n`;
}

test('admin chrome uses compact shared controls', async ({ page }) => {
  await page.goto('/admin/login');
  const submit = await styleOf(page.getByRole('button', { name: 'Sign in' }));
  expect(snapshot(submit)).toMatchSnapshot('admin-login-submit.json');

  await signIn(page);
  await page.goto('/admin');
  await page.mouse.move(0, 0);
  expect(snapshot(await chromeStyles(page))).toMatchSnapshot('admin-chrome.json');

  await page.goto('/admin/audit');
  const filter = await styleOf(page.locator('main select').first());
  expect(snapshot(filter)).toMatchSnapshot('admin-audit-filter.json');
});

test('the sidebar collapses through an icon button', async ({ page }) => {
  await signIn(page);
  await page.goto('/admin');
  const sidebar = page.locator('aside[data-collapsed]');
  const collapse = page.getByRole('button', { name: 'Collapse sidebar' });

  await expect(collapse).toHaveText('');
  await expect(collapse.locator('svg')).toBeVisible();
  await collapse.hover();
  await expect(page.getByRole('tooltip')).toHaveText('Collapse sidebar');

  await collapse.click();
  await expect(sidebar).toHaveAttribute('data-collapsed', 'true');
  const expand = page.getByRole('button', { name: 'Expand sidebar' });
  await expect(expand).toHaveAttribute('aria-expanded', 'false');

  await expand.click();
  await expect(sidebar).toHaveAttribute('data-collapsed', 'false');
});
