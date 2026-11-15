import { createHash } from 'node:crypto';

import { expect, test, type Page } from '@playwright/test';

import { signIn } from './helpers/auth';

const copy = {
  en: { title: 'Revision-linked work', eyebrow: 'Selected projects' },
  vi: { title: 'Dự án theo phiên bản', eyebrow: 'Dự án đã chọn' },
} as const;
const widths = [390, 768, 1440] as const;
type Draft = {
  revision: string;
  tree: {
    root: {
      sections: Array<{
        content: Array<{
          id: string;
          responsive: { base: { title: Record<string, string>; eyebrow: Record<string, string> } };
        }>;
      }>;
    };
  };
};

async function persistedDraft(page: Page, key: string, expected: Partial<typeof copy>) {
  let saved: Draft | null = null;
  await expect
    .poll(
      async () => {
        const response = await page.request.get(`/api/admin/pages/${key}/builder/draft`);
        if (response.status() !== 200) return false;
        const draft = (await response.json()) as Draft;
        const props = draft.tree?.root.sections[0]?.content[0]?.responsive.base;
        if (!props || !Number.isInteger(Number(draft.revision))) return false;
        const matches = Object.entries(expected).every(
          ([locale, values]) =>
            props.title?.[locale] === values.title && props.eyebrow?.[locale] === values.eyebrow,
        );
        if (matches) saved = draft;
        return matches;
      },
      { timeout: 30_000 },
    )
    .toBe(true);
  if (!saved) throw new Error('Draft revision was not persisted');
  return saved as Draft;
}

test('V05 editor nested Properties persist one revision into EN/VI preview and public', async ({
  page,
  context,
}, testInfo) => {
  test.setTimeout(240_000);
  await signIn(page);
  const key = `v05-revision-${Date.now()}-${testInfo.retry}`;
  const created = await page.request.post('/api/admin/pages', {
    headers: { Origin: new URL(page.url()).origin },
    data: { key, title: 'V05 revision chain', locale: 'en', template: 'starter' },
  });
  expect(created.status(), await created.text()).toBe(201);
  await page.goto(`/admin/builder/${key}`);
  await page.getByRole('button', { name: 'Activate tree draft' }).click();
  await expect(page.getByText('Draft saved', { exact: true })).toBeVisible();
  const palette = page.getByRole('complementary', { name: 'Components' });
  await palette.getByRole('button', { name: 'Section', exact: true }).click();
  await palette.getByRole('button', { name: 'Page header', exact: true }).click();
  const inspector = page.getByRole('complementary', { name: 'Properties' });
  const draftPath = `/api/admin/pages/${key}/builder/draft`;
  const initial = await page.request.get(draftPath);
  expect(initial.status(), await initial.text()).toBe(200);
  const initialRevision = Number((await initial.json()).revision);

  for (const locale of ['en', 'vi'] as const) {
    for (const property of ['title', 'eyebrow'] as const) {
      const label = `${property === 'title' ? 'Title' : 'Eyebrow'} (${locale.toUpperCase()})`;
      const field = inspector.getByRole('textbox', { name: label, exact: true });
      await expect(field).toHaveCount(1);
      await field.fill(copy[locale][property]);
      await expect
        .poll(
          async () => {
            const response = await page.request.get(draftPath);
            if (response.status() !== 200) return false;
            const draft = await response.json();
            return (
              draft.tree?.root.sections[0]?.content[0]?.responsive.base?.[property]?.[locale] ===
              copy[locale][property]
            );
          },
          { timeout: 30_000 },
        )
        .toBe(true);
    }
  }
  const saved = await persistedDraft(page, key, copy);
  expect(Number(saved.revision)).toBeGreaterThan(initialRevision);
  await expect(page.getByText('Draft saved', { exact: true })).toBeVisible();

  const publishResponse = page.waitForResponse(
    (response) =>
      response.request().method() === 'POST' &&
      response.url().endsWith(`/admin/pages/${key}/builder/publish`),
  );
  await page.getByRole('button', { name: 'Publish', exact: true }).click();
  const published = await publishResponse;
  expect(published.status(), await published.text()).toBe(200);
  const version = (await published.json()).publishedVersion as number;
  expect(version).toBe(1);
  const snapshotResponse = await page.request.get(`/api/admin/pages/${key}/versions/${version}`);
  expect(snapshotResponse.status(), await snapshotResponse.text()).toBe(200);
  expect((await snapshotResponse.json()).snapshot.tree).toEqual(saved.tree);

  const entries: Array<{ locale: string; width: number; surface: string; sha256: string }> = [];
  for (const locale of ['en', 'vi'] as const) {
    const publicResponse = await page.request.get(`/api/public/pages/${key}?locale=${locale}`);
    const previewResponse = await page.request.get(
      `/api/admin/preview/pages/${key}?locale=${locale}&version=${version}`,
    );
    expect(publicResponse.status(), await publicResponse.text()).toBe(200);
    expect(previewResponse.status(), await previewResponse.text()).toBe(200);
    const publicData = await publicResponse.json();
    expect(publicData.tree).toEqual(saved.tree);
    expect(await previewResponse.json()).toEqual({ ...publicData, invalidBlocks: [] });

    await context.addCookies([
      { name: 'NEXT_LOCALE', value: locale, url: new URL(page.url()).origin, sameSite: 'Lax' },
    ]);
    await page.goto(`/admin/builder/${key}`);
    await expect(page.locator('html')).toHaveAttribute('lang', locale);
    const savedNodeId = saved.tree.root.sections[0]!.content[0]!.id;
    const selectedNode = page.locator(
      `[data-node-type="component"] button[data-canvas-id="${savedNodeId}"]`,
    );
    await expect(selectedNode).toHaveCount(1);
    await selectedNode.click();
    const properties = locale === 'en' ? 'Properties' : 'Thuộc tính';
    for (const width of widths) {
      await page.setViewportSize({ width, height: 900 });
      const trigger = page
        .getByRole('navigation', { name: locale === 'en' ? 'Page builder' : 'Trình dựng trang' })
        .getByRole('button', { name: properties });
      const panel =
        width === 1440
          ? page.getByRole('complementary', { name: properties })
          : page.getByRole('dialog', { name: properties });
      if (width !== 1440) await trigger.click();
      for (const property of ['title', 'eyebrow'] as const) {
        const label = `${property === 'title' ? (locale === 'en' ? 'Title' : 'Tiêu đề') : locale === 'en' ? 'Eyebrow' : 'Dòng dẫn'} (${locale.toUpperCase()})`;
        await expect(panel.getByRole('textbox', { name: label, exact: true })).toHaveValue(
          copy[locale][property],
        );
      }
      const inspectorImage = await page.screenshot({ animations: 'disabled' });
      await testInfo.attach(`${locale}-${width}-properties.png`, {
        body: inspectorImage,
        contentType: 'image/png',
      });
      entries.push({
        locale,
        width,
        surface: 'properties',
        sha256: createHash('sha256').update(inspectorImage).digest('hex'),
      });
      if (width !== 1440) {
        await page.keyboard.press('Escape');
        await expect(panel).toBeHidden();
        await expect(trigger).toBeFocused();
      }
    }

    for (const width of widths) {
      await page.setViewportSize({ width, height: 900 });
      const path = `/${locale}/${key}`;
      let publicMarkup = '';
      for (const surface of ['public', 'preview'] as const) {
        if (surface === 'preview') await page.goto(`/api/draft?path=${encodeURIComponent(path)}`);
        await expect(async () => {
          await page.goto(surface === 'preview' ? `${path}?v=${version}` : path);
          await expect(page.locator('html')).toHaveAttribute('lang', locale);
          const host = page.locator('main.cms-core');
          await expect(
            host.getByRole('heading', { level: 1, name: copy[locale].title }),
          ).toBeVisible();
          await expect(host.getByText(copy[locale].eyebrow, { exact: true })).toBeVisible();
        }).toPass({ timeout: 30_000 });
        const host = page.locator('main.cms-core');
        const markup = await host.innerHTML();
        if (surface === 'public') publicMarkup = markup;
        else expect(markup).toBe(publicMarkup);
        const image = await page.screenshot({ animations: 'disabled' });
        await testInfo.attach(`${locale}-${width}-${surface}.png`, {
          body: image,
          contentType: 'image/png',
        });
        entries.push({
          locale,
          width,
          surface,
          sha256: createHash('sha256').update(image).digest('hex'),
        });
      }
      await page.goto(`/api/draft?exit=1&path=${encodeURIComponent(path)}`);
    }
  }
  expect(entries).toHaveLength(18);
  await testInfo.attach('v05-revision-manifest.json', {
    body: Buffer.from(
      JSON.stringify(
        {
          sourceHead: process.env.E2E_SOURCE_HEAD_SHA ?? null,
          ciRunId: process.env.GITHUB_RUN_ID ?? null,
          draftRevision: saved.revision,
          publishedVersion: version,
          treeHash: createHash('sha256').update(JSON.stringify(saved.tree)).digest('hex'),
          entries,
        },
        null,
        2,
      ),
    ),
    contentType: 'application/json',
  });
});
