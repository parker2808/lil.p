import { expect, test } from '@playwright/test';

import { signIn } from './helpers/auth';

test('editor toolbar is one scrolling row with a More menu at 375px', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 667 });
  await signIn(page);
  await page.goto('/admin/posts/new');

  const more = page.getByRole('button', { name: 'More', exact: true });
  const toolbar = page.getByRole('toolbar').filter({ has: more }).first();
  await expect(toolbar).toBeVisible();

  const box = await toolbar.boundingBox();
  expect(box?.height).toBeLessThanOrEqual(48);

  const scroll = await toolbar.evaluate((element) => {
    element.scrollLeft = element.scrollWidth;
    return {
      overflowX: getComputedStyle(element).overflowX,
      scrollWidth: element.scrollWidth,
      clientWidth: element.clientWidth,
      scrollLeft: element.scrollLeft,
    };
  });
  expect(scroll.overflowX).toBe('auto');
  expect(scroll.scrollWidth).toBeGreaterThan(scroll.clientWidth);
  expect(scroll.scrollLeft).toBeGreaterThan(0);

  await expect(toolbar.getByRole('button', { name: 'Divider' })).toBeHidden();
  const toolbarMore = toolbar.getByRole('button', { name: 'More', exact: true });
  await expect(toolbarMore).toBeVisible();
  await toolbarMore.click();
  const menu = page.getByRole('menu');
  await expect(menu.getByRole('menuitem')).toHaveText([
    'Quote',
    'Note',
    'Warning',
    'Code block',
    'Image',
    'Table',
    'Divider',
  ]);
  await menu.getByRole('menuitem', { name: 'Divider' }).click();
  await expect(menu).toBeHidden();
  await expect(page.locator('.ProseMirror hr').first()).toBeAttached();

  await toolbarMore.click();
  await menu.getByRole('menuitem', { name: 'Image' }).click();
  await expect(page.getByRole('dialog', { name: 'Choose a file' })).toBeVisible();
});

test('editor toolbar shows block actions inline on desktop', async ({ page }) => {
  await signIn(page);
  await page.goto('/admin/posts/new');

  const toolbar = page
    .getByRole('toolbar')
    .filter({ has: page.getByRole('button', { name: 'Divider' }) })
    .first();
  await expect(toolbar.getByRole('button', { name: 'Divider' })).toBeVisible();
  await expect(toolbar.getByRole('button', { name: 'More', exact: true })).toBeHidden();
});
