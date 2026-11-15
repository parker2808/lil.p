import { BLOCK_REGISTRY } from '@portfolio/contracts';
import { expect, test } from '@playwright/test';

import { signIn } from './auth';

export function registerEditorHostJourney(shard: number): void {
  const definitions = Object.values(BLOCK_REGISTRY);
  expect(definitions).toHaveLength(20);
  for (const definition of definitions.slice((shard - 1) * 5, shard * 5)) {
    test(`${definition.type}: palette, Properties, autosave and EN/VI preview/public parity`, async ({
      page,
    }) => {
      test.setTimeout(180_000);
      await signIn(page);
      const key = `editor-origin-${definition.type}-${Date.now()}`;
      const headers = { Origin: new URL(page.url()).origin };
      const created = await page.request.post('/api/admin/pages', {
        headers,
        data: { key, title: definition.type, locale: 'en', template: 'starter' },
      });
      expect(created.status(), await created.text()).toBe(201);
      const seo = await page.request.patch(`/api/admin/pages/${key}`, {
        headers,
        data: { seoTitleVi: `VI ${definition.type}` },
      });
      expect(seo.status(), await seo.text()).toBe(200);

      await page.goto(`/admin/builder/${key}`);
      await page.getByRole('button', { name: 'Activate tree draft' }).click();
      await expect(page.getByText('Draft saved')).toBeVisible();
      const palette = page.getByRole('complementary', { name: 'Components' });
      const inspector = page.getByRole('complementary', { name: 'Properties' });
      await palette.getByRole('button', { name: 'Section', exact: true }).click();
      if (definition.role !== 'h1') {
        await palette.getByRole('button', { name: 'Heading', exact: true }).click();
        await inspector.getByRole('spinbutton', { name: 'Heading level' }).fill('1');
      }
      await palette.getByRole('button', { name: definition.type, exact: true }).click();
      const addHeading = inspector.getByRole('button', { name: 'Add heading' });
      if (await addHeading.count()) await addHeading.click();

      const english = inspector.getByRole('textbox', { name: /\(EN\)$/ }).first();
      const vietnamese = inspector.getByRole('textbox', { name: /\(VI\)$/ }).first();
      const englishValue = `Edited ${definition.type}`;
      const vietnameseValue = `Sửa ${definition.type}`;
      if (await english.count()) {
        await english.fill(englishValue);
        await vietnamese.fill(vietnameseValue);
      } else {
        expect(['notes-browser', 'projects-browser']).toContain(definition.type);
        await inspector.getByRole('switch', { name: 'showFeatured' }).click();
      }

      const draftPath = `/api/admin/pages/${key}/builder/draft`;
      await expect
        .poll(
          async () => {
            const response = await page.request.get(draftPath);
            if (response.status() !== 200) return null;
            const body = await response.json();
            const host = body.tree?.root.sections[0]?.content.find(
              (node: { componentType?: string }) => node.componentType === definition.type,
            );
            const props = JSON.stringify(host?.responsive.base ?? {});
            const updated =
              (props.includes(englishValue) && props.includes(vietnameseValue)) ||
              (['notes-browser', 'projects-browser'].includes(definition.type) &&
                host?.responsive.base.showFeatured === false);
            return updated && Number(body.revision) > 1 ? body : null;
          },
          { timeout: 30_000 },
        )
        .not.toBeNull();
      const read = await page.request.get(draftPath);
      const draft = await read.json();
      expect(read.status()).toBe(200);
      expect(draft.revision).not.toBe('1');
      for (const locale of ['en', 'vi']) {
        const preview = await page.request.get(`/api/admin/preview/pages/${key}?locale=${locale}`);
        expect(preview.status(), `${definition.type}/${locale}: ${await preview.text()}`).toBe(200);
        expect((await preview.json()).tree).toEqual(draft.tree);
      }
      const published = await page.request.post(`/api/admin/pages/${key}/builder/publish`, {
        headers,
        data: { expectedRevision: draft.revision },
      });
      expect(published.status(), `${definition.type}: ${await published.text()}`).toBe(200);

      for (const locale of ['en', 'vi']) {
        const preview = await page.request.get(
          `/api/admin/preview/pages/${key}?locale=${locale}&version=1`,
        );
        const publicPage = await page.request.get(`/api/public/pages/${key}?locale=${locale}`);
        expect(preview.status()).toBe(200);
        expect(publicPage.status()).toBe(200);
        const publicBody = await publicPage.json();
        expect(publicBody.tree).toEqual(draft.tree);
        expect(publicBody.seo.lang).toBe(locale);
        expect(await preview.json()).toEqual({ ...publicBody, invalidBlocks: [] });
        await page.goto(`/${locale}/${key}`);
        const host = page.locator(`[data-host-block-type="${definition.type}"]`);
        await expect(host).toHaveCount(1);
        const publishedHash = await host.getAttribute('data-host-props-hash');
        expect(publishedHash).toMatch(/^[a-f0-9]{64}$/);
        const publicHtml = await page.locator('main.cms-core').innerHTML();
        await page.goto(`/api/draft?path=${encodeURIComponent(`/${locale}/${key}`)}`);
        await page.goto(`/${locale}/${key}?v=1`);
        await expect(host).toHaveCount(1);
        expect(await host.getAttribute('data-host-props-hash')).toBe(publishedHash);
        expect(await page.locator('main.cms-core').innerHTML()).toBe(publicHtml);
        await page.goto(`/api/draft?exit=1&path=${encodeURIComponent(`/${locale}/${key}`)}`);
      }
    });
  }
}
