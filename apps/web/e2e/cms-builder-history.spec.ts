import { expect, test, type Page } from '@playwright/test';

import { signIn } from './helpers/auth';

async function draft(page: Page, key: string) {
  const response = await page.request.get(`/api/admin/pages/${key}/builder/draft`);
  expect(response.status(), await response.text()).toBe(200);
  return response.json() as Promise<{
    revision: string;
    tree: {
      root: {
        sections: Array<{
          content: Array<{ id: string; responsive: { base: { text?: string; level?: number } } }>;
        }>;
      };
    };
  }>;
}

test.setTimeout(180_000);

for (const locale of ['en', 'vi'] as const) {
  test(`Properties ${locale}: blur separates rapid keyboard undo and clear resets invalid override`, async ({
    page,
    context,
  }) => {
    await signIn(page);
    const key = `property-sessions-${locale}-${Date.now()}`;
    const origin = new URL(page.url()).origin;
    const created = await page.request.post('/api/admin/pages', {
      headers: { Origin: origin },
      data: { key, title: 'Property sessions', locale, template: 'starter' },
    });
    expect(created.status(), await created.text()).toBe(201);
    await context.addCookies([
      { name: 'NEXT_LOCALE', value: locale, url: origin, sameSite: 'Lax' },
    ]);
    await page.goto(`/admin/builder/${key}`);
    await page
      .getByRole('button', {
        name: locale === 'vi' ? 'Kích hoạt bản nháp cây' : 'Activate tree draft',
      })
      .click();
    const palette = page.getByRole('complementary', {
      name: locale === 'vi' ? 'Thành phần' : 'Components',
    });
    await palette
      .getByRole('button', { name: locale === 'vi' ? 'Phần' : 'Section', exact: true })
      .click();
    await palette
      .getByRole('button', { name: locale === 'vi' ? 'Tiêu đề' : 'Heading', exact: true })
      .click();
    const inspector = page.getByRole('complementary', {
      name: locale === 'vi' ? 'Thuộc tính' : 'Properties',
    });
    const text = inspector.getByRole('textbox', { name: locale === 'vi' ? 'Văn bản' : 'Text' });
    const original = await text.inputValue();
    await page.clock.setFixedTime(new Date('2026-11-15T00:00:00Z'));
    await text.fill('First edit');
    await text.press('Tab');
    await text.fill('Second edit');
    await page.getByRole('button', { name: locale === 'vi' ? 'Hoàn tác' : 'Undo' }).click();
    await expect(text).toHaveValue('First edit');
    await page.getByRole('button', { name: locale === 'vi' ? 'Hoàn tác' : 'Undo' }).click();
    await expect(text).toHaveValue(original);
    await inspector.getByRole('button', { name: locale === 'vi' ? 'Di động' : 'Mobile' }).click();
    const level = inspector.getByRole('spinbutton', {
      name: locale === 'vi' ? 'Cấp tiêu đề' : 'Heading level',
    });
    await level.fill('3');
    await expect(level).toHaveValue('3');
    await level.fill('99');
    await expect(level).toHaveAttribute('aria-invalid', 'true');
    await level.press('Tab');
    await inspector
      .getByRole('button', {
        name: new RegExp(
          locale === 'vi' ? 'Xóa ghi đè.*Cấp tiêu đề' : 'Clear override.*Heading level',
        ),
      })
      .click();
    await expect(level).toHaveValue('2');
    await expect(level).toHaveAttribute('aria-invalid', 'false');
    await expect(inspector.getByRole('alert')).toHaveCount(0);
  });
}

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
  await page.getByRole('button', { name: 'Undo' }).click();
  await expect(page.locator('[data-node-type="section"]')).toHaveCount(0);
  await page.getByRole('button', { name: 'Redo' }).click();
  await expect(page.locator('[data-node-type="section"]')).toHaveCount(1);
  await palette.getByRole('button', { name: 'Heading', exact: true }).click();
  await page.getByRole('button', { name: 'Undo' }).click();
  await expect(page.locator('[data-node-type="component"]')).toHaveCount(0);
  await page.getByRole('button', { name: 'Redo' }).click();
  await expect(page.locator('[data-node-type="component"]')).toHaveCount(1);
  const inspector = page.getByRole('complementary', { name: 'Properties' });
  const text = inspector.getByRole('textbox', { name: 'Text' });
  const originalText = await text.inputValue();
  await text.fill('Edited heading');
  await page.getByRole('button', { name: 'Undo' }).click();
  await expect(text).toHaveValue(originalText);
  await page.getByRole('button', { name: 'Redo' }).click();
  await expect(text).toHaveValue('Edited heading');
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
      async () => (await draft(page, key)).tree.root.sections[0]?.content.map((node) => node.id),
      {
        timeout: 20_000,
      },
    )
    .toEqual([originalIds[1], originalIds[0]]);
  const savedNodes = (await draft(page, key)).tree.root.sections[0]!.content;
  expect(savedNodes.map((node) => node.responsive.base.text)).toEqual([
    'Edited heading',
    'Edited heading',
  ]);
  expect(savedNodes[0]!.id).not.toBe(savedNodes[1]!.id);
  const { id: copiedId, ...copied } = savedNodes[0]!;
  const { id: sourceId, ...source } = savedNodes[1]!;
  expect(copiedId).not.toBe(sourceId);
  expect(copied).toEqual(source);
  await expect(page.getByText('Draft saved')).toBeVisible();
  await page.reload();
  await expect(headings).toHaveCount(2);
  expect(
    await headings.evaluateAll((nodes) =>
      nodes.map((node) => node.querySelector('[data-canvas-id]')?.getAttribute('data-canvas-id')),
    ),
  ).toEqual([originalIds[1], originalIds[0]]);
  expect((await draft(page, key)).tree.root.sections[0]!.content).toEqual(savedNodes);
  await expect(page.getByRole('button', { name: 'Undo' })).toBeDisabled();
});

test('V07: offline recovery retains edits and stale publish cannot replace the draft', async ({
  page,
  context,
}) => {
  await signIn(page);
  const key = `v07-recovery-${Date.now()}`;
  const origin = new URL(page.url()).origin;
  const created = await page.request.post('/api/admin/pages', {
    headers: { Origin: origin },
    data: { key, title: 'History recovery', locale: 'en', template: 'starter' },
  });
  expect(created.status(), await created.text()).toBe(201);
  await page.goto(`/admin/builder/${key}`);
  await page.getByRole('button', { name: 'Activate tree draft' }).click();
  const palette = page.getByRole('complementary', { name: 'Components' });
  await palette.getByRole('button', { name: 'Section', exact: true }).click();
  await palette.getByRole('button', { name: 'Heading', exact: true }).click();
  const inspector = page.getByRole('complementary', { name: 'Properties' });
  await inspector.getByRole('spinbutton', { name: 'Heading level' }).fill('1');
  const text = inspector.getByRole('textbox', { name: 'Text' });
  await text.fill('Before network failure');
  await expect
    .poll(
      async () => (await draft(page, key)).tree.root.sections[0]?.content[0]?.responsive.base.text,
    )
    .toBe('Before network failure');
  await expect(page.getByText('Draft saved')).toBeVisible();
  const baseline = await draft(page, key);
  await expect(page.getByRole('button', { name: 'Undo' })).toBeEnabled();
  await context.setOffline(true);
  await text.fill('Retained local edit');
  await expect(page.getByText('Offline · your edits are kept locally')).toBeVisible();
  expect(await draft(page, key)).toEqual(baseline);
  await page.getByRole('button', { name: 'Undo' }).click();
  await expect(text).toHaveValue('Before network failure');
  await page.getByRole('button', { name: 'Redo' }).click();
  await expect(text).toHaveValue('Retained local edit');
  expect(await draft(page, key)).toEqual(baseline);
  await expect(page.getByRole('button', { name: 'Retry', exact: true })).toBeVisible();
  await context.setOffline(false);
  await page.getByRole('button', { name: 'Retry', exact: true }).click();
  await expect
    .poll(
      async () => (await draft(page, key)).tree.root.sections[0]?.content[0]?.responsive.base.text,
      {
        timeout: 30_000,
      },
    )
    .toBe('Retained local edit');
  await expect(page.getByText('Draft saved')).toBeVisible();
  const saved = await draft(page, key);
  const versionsBefore = await page.request.get(`/api/admin/pages/${key}/versions`);
  expect(versionsBefore.status(), await versionsBefore.text()).toBe(200);
  const versions = await versionsBefore.json();
  const concurrent = await page.request.put(`/api/admin/pages/${key}/builder/draft`, {
    headers: { Origin: origin },
    data: { expectedRevision: saved.revision, tree: saved.tree },
  });
  expect(concurrent.status(), await concurrent.text()).toBe(200);
  const current = await draft(page, key);
  expect(current.revision).not.toBe(saved.revision);
  expect(current.tree).toEqual(saved.tree);
  const published = await page.request.post(`/api/admin/pages/${key}/builder/publish`, {
    headers: { Origin: origin },
    data: { expectedRevision: saved.revision },
  });
  expect(published.status(), await published.text()).toBe(409);
  expect(await published.json()).toMatchObject({
    code: 'CONFLICT',
    mode: 'tree',
    revision: current.revision,
  });
  expect(await draft(page, key)).toEqual(current);
  const versionsAfter = await page.request.get(`/api/admin/pages/${key}/versions`);
  expect(versionsAfter.status(), await versionsAfter.text()).toBe(200);
  expect(await versionsAfter.json()).toEqual(versions);
  await page.reload();
  await expect(page.getByRole('button', { name: 'Undo' })).toBeDisabled();
  await expect(page.getByRole('button', { name: 'Select Heading' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Undo' })).toBeDisabled();
  await expect(page.getByRole('button', { name: 'Redo' })).toBeDisabled();
  expect(await draft(page, key)).toEqual(current);
});
