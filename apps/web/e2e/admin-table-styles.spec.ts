import { expect, type Locator, type Page, test } from '@playwright/test';

import { signIn } from './helpers/auth';

const PROPERTIES = [
  'font-size',
  'line-height',
  'font-weight',
  'letter-spacing',
  'text-transform',
  'color',
  'background-color',
  'padding-top',
  'padding-right',
  'padding-bottom',
  'padding-left',
  'border-bottom-color',
  'border-radius',
];

/** Cell heights follow content wrapping, so only fixed-height elements record theirs. */
async function styleOf(locator: Locator, { fixedHeight = false } = {}) {
  if ((await locator.count()) === 0) {
    return null;
  }
  const properties = fixedHeight ? [...PROPERTIES, 'height'] : PROPERTIES;
  return locator.first().evaluate((element, names) => {
    const style = getComputedStyle(element);
    return Object.fromEntries(names.map((name) => [name, style.getPropertyValue(name)]));
  }, properties);
}

async function tableStyles(page: Page) {
  const table = page.locator('main table').first();
  const body = table.locator('tbody');
  await expect(body.locator('tr:not([data-state])').first()).toBeVisible();
  await expect(table.locator('[data-slot="skeleton"]')).toHaveCount(0);
  return {
    head: await styleOf(table.locator('[data-slot="table-head"]').last(), { fixedHeight: true }),
    cell: await styleOf(body.locator('[data-slot="table-cell"]:not(:has(a))').last()),
    linkedCell: await styleOf(body.locator('[data-slot="table-cell"]:has(> a)')),
    input: await styleOf(page.locator('main [data-slot="input"]'), { fixedHeight: true }),
  };
}

function snapshot(value: unknown) {
  return `${JSON.stringify(value, null, 2)}\n`;
}

test('admin table and input styles match the approved snapshots', async ({ page }) => {
  await signIn(page);

  for (const route of ['projects', 'users', 'audit', 'tags']) {
    await page.goto(`/admin/${route}`);
    expect(snapshot(await tableStyles(page))).toMatchSnapshot(`admin-${route}.json`);
  }

  await page.goto('/admin/projects');
  const search = page.getByRole('textbox', { name: 'Filter projects' });
  await search.fill('zz-no-matching-project');
  await search.press('Enter');
  const status = page.locator('main tbody tr[data-state="empty"] [data-slot="table-cell"]');
  await expect(status).toBeVisible();
  expect(snapshot(await styleOf(status))).toMatchSnapshot('admin-projects-empty.json');
});
