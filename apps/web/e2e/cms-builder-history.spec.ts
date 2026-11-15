import { expect, test } from '@playwright/test';

import { signIn } from './helpers/auth';

test('V07: edit, duplicate and move remain atomic across undo/redo and confirmed save', async ({
  page,
}) => {
  await signIn(page);
  const key = `v07-history-${Date.now()}`;
  const origin = new URL(page.url()).origin;
  const created = await page.request.post('/api/admin/pages', {
    headers: { Origin: origin },
    data: { key, title: 'History gate', locale: 'en', template: 'starter' },
  });
  expect(created.status(), await created.text()).toBe(201);
  await page.goto(`/admin/builder/${key}`);
  await page.getByRole('button', { name: 'Activate tree draft' }).click();
  await expect(page.getByText('Draft saved')).toBeVisible();
  const palette = page.getByRole('complementary', { name: 'Components' });
  await palette.getByRole('button', { name: 'Section', exact: true }).click();
  await palette.getByRole('button', { name: 'Heading', exact: true }).click();
  const inspector = page.getByRole('complementary', { name: 'Properties' });
  await inspector.getByRole('textbox', { name: 'Text' }).fill('Edited heading');
  await expect(page.getByText('Draft saved')).toBeVisible();
  await page.getByRole('button', { name: 'Duplicate Heading' }).first().click();
  const headings = page.locator('[data-node-type="component"]');
  await expect(headings).toHaveCount(2);
  const originalIds = await headings.evaluateAll((nodes) =>
    nodes.map((node) => node.querySelector('[data-canvas-id]')?.getAttribute('data-canvas-id')),
  );
  expect(new Set(originalIds).size).toBe(2);
  await page.getByRole('button', { name: 'Move ↑' }).first().click();
  await expect(headings.first().locator('[data-canvas-id]')).toHaveAttribute(
    'data-canvas-id',
    originalIds[1]!,
  );
  await page.getByRole('button', { name: 'Undo' }).click();
  await expect(headings.first().locator('[data-canvas-id]')).toHaveAttribute(
    'data-canvas-id',
    originalIds[0]!,
  );
  await page.getByRole('button', { name: 'Undo' }).click();
  await expect(headings).toHaveCount(1);
  await page.getByRole('button', { name: 'Redo' }).click();
  await page.getByRole('button', { name: 'Redo' }).click();
  await expect(headings).toHaveCount(2);
  await expect(headings.first().locator('[data-canvas-id]')).toHaveAttribute(
    'data-canvas-id',
    originalIds[1]!,
  );
  await expect
    .poll(
      async () => {
        const draft = await page.request.get(`/api/admin/pages/${key}/builder/draft`);
        expect(draft.status()).toBe(200);
        const body = await draft.json();
        return body.tree.root.sections[0].content.map((node: { id: string }) => node.id);
      },
      { timeout: 20_000 },
    )
    .toEqual([originalIds[1], originalIds[0]]);
  await expect(page.getByText('Draft saved')).toBeVisible();
  await page.reload();
  await expect(headings).toHaveCount(2);
  expect(
    await headings.evaluateAll((nodes) =>
      nodes.map((node) => node.querySelector('[data-canvas-id]')?.getAttribute('data-canvas-id')),
    ),
  ).toEqual([originalIds[1], originalIds[0]]);
  await expect(page.getByRole('button', { name: 'Undo' })).toBeDisabled();
});
