import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';

import { signIn } from './helpers/auth';

type Draft = {
  mode: 'tree';
  revision: string;
  tree: {
    root: {
      sections: Array<{
        content: Array<{
          type: string;
          componentType?: string;
          responsive?: Record<string, Record<string, unknown>>;
          columns?: Array<{ content: Array<{ componentType?: string }> }>;
        }>;
      }>;
    };
  };
};

async function createDraft(page: Page, name: string) {
  const key = `d5-live-${name}-${Date.now()}`;
  const origin = new URL(page.url()).origin;
  const created = await page.request.post('/api/admin/pages', {
    headers: { Origin: origin },
    data: { title: `D5 live ${name}`, key, locale: 'en', template: 'starter' },
  });
  expect(created.status(), await created.text()).toBe(201);
  await page.goto(`/admin/builder/${key}`);
  await page.getByRole('button', { name: 'Activate tree draft' }).click();
  await expect(page.getByText('Draft saved')).toBeVisible();
  return { key, origin };
}

async function readDraft(page: Page, key: string): Promise<Draft> {
  const response = await page.request.get(`/api/admin/pages/${key}/builder/draft`);
  expect(response.status(), await response.text()).toBe(200);
  return response.json() as Promise<Draft>;
}

async function savedWith(page: Page, key: string, matches: (draft: Draft) => boolean) {
  await expect
    .poll(async () => matches(await readDraft(page, key)), { timeout: 20_000 })
    .toBe(true);
  await expect(page.getByText('Draft saved')).toBeVisible();
}

test.setTimeout(240_000);

test('J01/J02/V01: mouse nesting saves a no-H1 draft and incomplete publish cannot change it', async ({
  page,
}) => {
  await signIn(page);
  const { key, origin } = await createDraft(page, 'mouse');
  const palette = page.getByRole('complementary', { name: 'Components' });
  await palette
    .getByRole('button', { name: 'Section', exact: true })
    .dragTo(page.locator('[data-node-type="page"]'));
  await palette.getByRole('button', { name: 'Columns', exact: true }).click();
  await palette.getByRole('button', { name: 'Paragraph', exact: true }).click();
  await expect(
    page.locator('[data-node-type="column"]').first().locator('[data-node-type="component"]'),
  ).toHaveCount(1);
  await savedWith(
    page,
    key,
    (draft) =>
      draft.tree.root.sections[0]?.content[0]?.columns?.[0]?.content[0]?.componentType ===
      'paragraph',
  );
  const before = await readDraft(page, key);
  const rejected = await page.request.post(`/api/admin/pages/${key}/builder/publish`, {
    headers: { Origin: origin },
    data: { expectedRevision: before.revision },
  });
  expect(rejected.status()).toBe(400);
  expect(await rejected.json()).toMatchObject({
    code: 'VALIDATION_FAILED',
    fieldErrors: { tree: [expect.stringContaining('HEADING_RULE')] },
  });
  expect(await readDraft(page, key)).toEqual(before);
  await page.reload();
  await expect(page.locator('[data-node-type="column"]')).toHaveCount(2);
  await expect(
    page.locator('[data-node-type="column"]').first().locator('[data-node-type="component"]'),
  ).toHaveCount(1);
  expect(await readDraft(page, key)).toEqual(before);
});

test('J03/V02/V07: keyboard nesting, invalid drop, delete rejection and undo/redo preserve the saved tree', async ({
  page,
}) => {
  await signIn(page);
  const { key } = await createDraft(page, 'keyboard');
  const palette = page.getByRole('complementary', { name: 'Components' });
  for (const name of ['Section', 'Columns', 'Heading']) {
    await palette.getByRole('button', { name, exact: true }).focus();
    await page.keyboard.press('Enter');
  }
  const tree = page.getByRole('complementary', { name: 'Layers' }).getByRole('tree');
  const heading = tree.getByRole('treeitem', { name: /Heading/ });
  await heading.focus();
  await page.keyboard.press('Space');
  await expect(page.getByRole('status')).toContainText('Picked up');
  await page.keyboard.press('ArrowUp');
  await expect(page.getByRole('status')).toContainText('Column 2 · position 1');
  await page.keyboard.press('Enter');
  await expect(
    page.locator('[data-node-type="column"]').nth(1).locator('[data-node-type="component"]'),
  ).toHaveCount(1);
  await savedWith(
    page,
    key,
    (draft) =>
      draft.tree.root.sections[0]?.content[0]?.columns?.[1]?.content[0]?.componentType ===
      'heading',
  );
  const before = await readDraft(page, key);
  await heading.dragTo(page.locator('[data-node-type="page"]'));
  await expect(page.getByRole('status')).toContainText('does not accept');
  expect(await readDraft(page, key)).toEqual(before);
  await tree.getByRole('treeitem', { name: /^Columns / }).focus();
  await page.keyboard.press('ArrowRight');
  const column = tree.getByRole('treeitem', { name: /^Column / }).first();
  await column.focus();
  await page.keyboard.press('Delete');
  await page.getByRole('alertdialog').getByRole('button', { name: 'Delete' }).click();
  await expect(page.getByRole('status')).toContainText('Keep at least two columns');
  await expect(column).toBeFocused();
  expect(await readDraft(page, key)).toEqual(before);
  await palette.getByRole('button', { name: 'Divider', exact: true }).click();
  await expect(page.locator('[data-node-type="component"]')).toHaveCount(2);
  await page.getByRole('button', { name: 'Undo' }).click();
  await expect(page.locator('[data-node-type="component"]')).toHaveCount(1);
  await page.getByRole('button', { name: 'Redo' }).click();
  await savedWith(
    page,
    key,
    (draft) =>
      draft.tree.root.sections[0]?.content[0]?.columns?.some((item) =>
        item.content.some((component) => component.componentType === 'divider'),
      ) ?? false,
  );
  await page.reload();
  await expect(page.locator('[data-node-type="component"]')).toHaveCount(2);
});

test('J05/V06/V08: responsive edits, divergent 409 and offline recovery retain the local draft', async ({
  page,
  context,
}) => {
  await signIn(page);
  const { key, origin } = await createDraft(page, 'recovery');
  const palette = page.getByRole('complementary', { name: 'Components' });
  await palette.getByRole('button', { name: 'Section', exact: true }).click();
  await palette.getByRole('button', { name: 'Heading', exact: true }).click();
  const inspector = page.getByRole('complementary', { name: 'Properties' });
  await inspector.getByRole('textbox', { name: 'Text' }).fill('Base heading');
  await inspector.getByRole('button', { name: 'Mobile' }).click();
  await inspector.getByRole('textbox', { name: 'Text' }).fill('Mobile heading');
  await savedWith(page, key, (draft) => {
    const heading = draft.tree.root.sections[0]?.content[0];
    return (
      heading?.responsive?.base?.text === 'Base heading' &&
      heading.responsive.mobile?.text === 'Mobile heading'
    );
  });
  const baseline = await readDraft(page, key);
  await page.reload();
  await page.getByRole('treeitem', { name: /Section/ }).focus();
  await page.keyboard.press('ArrowRight');
  await page.getByRole('treeitem', { name: /Heading/ }).click();
  await expect(inspector.getByRole('textbox', { name: 'Text' })).toHaveValue('Base heading');
  await inspector.getByRole('button', { name: 'Mobile' }).click();
  await expect(inspector.getByRole('textbox', { name: 'Text' })).toHaveValue('Mobile heading');
  const concurrent = structuredClone(baseline.tree);
  concurrent.root.sections[0]!.content[0]!.responsive!.base!.text = 'Other editor';
  const write = await page.request.put(`/api/admin/pages/${key}/builder/draft`, {
    headers: { Origin: origin },
    data: { tree: concurrent, expectedRevision: baseline.revision },
  });
  expect(write.status(), await write.text()).toBe(200);
  await palette.getByRole('button', { name: 'Divider', exact: true }).click();
  await expect(page.getByText('Conflict · your edits are kept locally')).toBeVisible();
  expect((await readDraft(page, key)).tree).toEqual(concurrent);
  await page.getByRole('button', { name: 'Review changes' }).click();
  await page
    .getByRole('region', { name: 'Review changes' })
    .getByRole('button', { name: 'Retry' })
    .click();
  await expect(page.locator('[data-node-type="component"]')).toHaveCount(2);
  expect((await readDraft(page, key)).tree).toEqual(concurrent);
  await page
    .getByRole('region', { name: 'Review changes' })
    .getByRole('button', { name: 'Discard local edits and reload server draft' })
    .click();
  await expect(page.locator('[data-node-type="component"]')).toHaveCount(1);
  await context.setOffline(true);
  await palette.getByRole('button', { name: 'Divider', exact: true }).click();
  await expect(page.getByText('Offline · your edits are kept locally')).toBeVisible();
  await expect(page.locator('[data-node-type="component"]')).toHaveCount(2);
  await context.setOffline(false);
  await page.getByRole('button', { name: 'Retry' }).first().click();
  await savedWith(
    page,
    key,
    (draft) =>
      draft.tree.root.sections[0]?.content.some(
        (item) =>
          item.componentType === 'divider' ||
          item.columns?.some((column) =>
            column.content.some((component) => component.componentType === 'divider'),
          ),
      ) ?? false,
  );
});

test('V13/V15 subsets: real draft chrome is localized, keyboard reachable and accessible at 390/1440', async ({
  page,
  context,
}) => {
  await signIn(page);
  const { key } = await createDraft(page, 'locale');
  for (const locale of ['en', 'vi'] as const) {
    await context.addCookies([
      { name: 'NEXT_LOCALE', value: locale, url: new URL(page.url()).origin, sameSite: 'Lax' },
    ]);
    for (const theme of ['light', 'dark'] as const) {
      await page.setViewportSize({ width: 1440, height: 900 });
      await page.goto(`/admin/builder/${key}`);
      await page.evaluate(
        (value) => document.documentElement.classList.toggle('dark', value === 'dark'),
        theme,
      );
      await expect(page.locator('html')).toHaveAttribute('lang', locale);
      await expect(
        page.getByText(locale === 'en' ? 'Draft saved' : 'Đã lưu bản nháp'),
      ).toBeVisible();
      const palette = page.getByRole('complementary', {
        name: locale === 'en' ? 'Components' : 'Thành phần',
      });
      await expect(
        palette.getByRole('button', { name: locale === 'en' ? 'Section' : 'Phần', exact: true }),
      ).toBeVisible();
      for (const width of [1440, 390]) {
        await page.setViewportSize({ width, height: 900 });
        const navigation = page.getByRole('navigation', {
          name: locale === 'en' ? 'Page builder' : 'Trình dựng trang',
        });
        if (width === 390) {
          for (const button of await navigation.getByRole('button').all()) {
            const bounds = await button.boundingBox();
            expect(bounds?.width).toBeGreaterThanOrEqual(44);
            expect(bounds?.height).toBeGreaterThanOrEqual(44);
          }
          const trigger = navigation.getByRole('button', {
            name: locale === 'en' ? 'Components' : 'Thành phần',
          });
          await trigger.focus();
          await page.keyboard.press('Enter');
          await expect(
            page.getByRole('dialog', { name: locale === 'en' ? 'Components' : 'Thành phần' }),
          ).toBeVisible();
        }
        const result = await new AxeBuilder({ page })
          .include(width === 390 ? '[role="dialog"]' : '.cms-core')
          .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
          .analyze();
        expect(result.violations, `${locale}/${theme}/${width}`).toEqual([]);
        await test.info().attach(`draft-${locale}-${theme}-${width}`, {
          body: await page.screenshot({ animations: 'disabled' }),
          contentType: 'image/png',
        });
        if (width === 390) {
          await page.keyboard.press('Escape');
          await expect(
            navigation.getByRole('button', {
              name: locale === 'en' ? 'Components' : 'Thành phần',
            }),
          ).toBeFocused();
        }
      }
    }
  }
  expect((await readDraft(page, key)).mode).toBe('tree');
});
