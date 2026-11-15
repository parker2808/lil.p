import { createHash } from 'node:crypto';

import { BLOCK_REGISTRY, resolveBlockLocale } from '@portfolio/contracts';
import { expect, test } from '@playwright/test';

import viMessages from '../../i18n/locales/vi.json' with { type: 'json' };
import { BLOCK_EDITOR_META } from '../../src/modules/admin-pages/constants/block-editor-meta.constant';
import { signIn } from './auth';

export function registerEditorHostJourney(shard: number): void {
  const definitions = Object.values(BLOCK_REGISTRY);
  expect(definitions).toHaveLength(20);
  for (const definition of definitions.slice((shard - 1) * 5, shard * 5)) {
    test(`${definition.type}: palette, Properties, autosave and EN/VI preview/public parity`, async ({
      page,
      context,
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

      await context.addCookies([
        { name: 'NEXT_LOCALE', value: 'vi', url: new URL(page.url()).origin, sameSite: 'Lax' },
      ]);
      await page.goto(`/admin/builder/${key}`);
      await expect(page.locator('html')).toHaveAttribute('lang', 'vi');
      await page.getByRole('button', { name: 'Kích hoạt bản nháp cây' }).click();
      await expect(page.getByText('Đã lưu bản nháp')).toBeVisible();
      const palette = page.getByRole('complementary', { name: 'Thành phần' });
      const inspector = page.getByRole('complementary', { name: 'Thuộc tính' });
      await palette.getByRole('button', { name: 'Phần', exact: true }).click();
      if (definition.role !== 'h1') {
        await palette.getByRole('button', { name: 'Tiêu đề', exact: true }).click();
        await inspector.getByRole('spinbutton', { name: 'Cấp tiêu đề' }).fill('1');
      }
      const labelKey = BLOCK_EDITOR_META[definition.type].labelKey
        .split('.')
        .at(-1) as keyof typeof viMessages.admin.pages.types;
      const hostName = viMessages.admin.pages.types[labelKey];
      const search = palette.getByRole('textbox', { name: 'Tìm thành phần' });
      await search.fill(hostName);
      const hostTile = palette.getByRole('button', { name: hostName, exact: true });
      await expect(hostTile).toBeVisible();
      await hostTile.click();
      await expect(
        inspector.getByText(hostName, { exact: true }).and(inspector.locator('p')),
      ).toBeVisible();
      const addHeading = inspector.getByRole('button', { name: 'Thêm tiêu đề' });
      if (await addHeading.count()) await addHeading.click();

      const englishValue = `Edited ${definition.type}`;
      const vietnameseValue = `Sửa ${definition.type}`;
      if (['notes-browser', 'projects-browser'].includes(definition.type)) {
        await inspector.getByRole('switch', { name: 'showFeatured' }).click();
      } else {
        const englishTitle = inspector.getByRole('textbox', { name: /(?:heading )?title \(EN\)$/ });
        const english = (await englishTitle.count())
          ? englishTitle.first()
          : inspector.getByRole('textbox', { name: /\(EN\)$/ }).first();
        const vietnameseTitle = inspector.getByRole('textbox', {
          name: /(?:heading )?title \(VI\)$/,
        });
        const vietnamese = (await vietnameseTitle.count())
          ? vietnameseTitle.first()
          : inspector.getByRole('textbox', { name: /\(VI\)$/ }).first();
        await expect(english).toBeVisible();
        await english.fill(englishValue);
        await vietnamese.fill(vietnameseValue);
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
      const savedHost = draft.tree.root.sections[0].content.find(
        (node: { componentType?: string }) => node.componentType === definition.type,
      );
      expect(savedHost).toBeDefined();
      const visibleEdit = [
        'hero',
        'page-header',
        'contact-form',
        'cta-band',
        'prose',
        'about-intro',
      ];
      const draftRender = new Map<string, { hash: string; editedText: string | null }>();
      for (const locale of ['en', 'vi']) {
        const preview = await page.request.get(`/api/admin/preview/pages/${key}?locale=${locale}`);
        expect(preview.status(), `${definition.type}/${locale}: ${await preview.text()}`).toBe(200);
        expect((await preview.json()).tree).toEqual(draft.tree);
        const path = `/${locale}/${key}`;
        await page.goto(`/api/draft?path=${encodeURIComponent(path)}`);
        const draftResponse = await page.goto(path);
        expect(draftResponse?.status()).toBe(200);
        expect(await draftResponse?.text()).toContain(`data-host-block-type="${definition.type}"`);
        const draftHost = page.locator(`[data-host-block-type="${definition.type}"]`);
        await expect(draftHost).toHaveCount(1);
        let editedText: string | null = null;
        if (visibleEdit.includes(definition.type)) {
          const resolved = resolveBlockLocale(savedHost.responsive.base, locale as 'en' | 'vi');
          editedText = resolved.lang === 'vi' ? vietnameseValue : englishValue;
          await expect(draftHost).toContainText(editedText);
        }
        const hash = await draftHost.getAttribute('data-host-props-hash');
        const resolved = resolveBlockLocale(savedHost.responsive.base, locale as 'en' | 'vi');
        expect(hash).toBe(
          createHash('sha256')
            .update(JSON.stringify({ props: resolved.props, lang: resolved.lang }))
            .digest('hex'),
        );
        draftRender.set(locale, {
          hash: hash ?? '',
          editedText,
        });
        await page.goto(`/api/draft?exit=1&path=${encodeURIComponent(path)}`);
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
        expect(publishedHash).toBe(draftRender.get(locale)?.hash);
        const editedText = draftRender.get(locale)?.editedText;
        if (editedText) await expect(host).toContainText(editedText);
        await page.goto(`/api/draft?path=${encodeURIComponent(`/${locale}/${key}`)}`);
        await page.goto(`/${locale}/${key}?v=1`);
        await expect(host).toHaveCount(1);
        expect(await host.getAttribute('data-host-props-hash')).toBe(publishedHash);
        if (editedText) await expect(host).toContainText(editedText);
        await page.goto(`/api/draft?exit=1&path=${encodeURIComponent(`/${locale}/${key}`)}`);
      }
      if (definition.type === 'hero') {
        const current = await (await page.request.get(draftPath)).json();
        const nextTree = structuredClone(draft.tree);
        const nextHost = nextTree.root.sections[0].content.find(
          (node: { componentType?: string }) => node.componentType === definition.type,
        );
        nextHost.responsive.base.showDiagram = false;
        const updated = await page.request.put(draftPath, {
          headers,
          data: { expectedRevision: current.revision, tree: nextTree },
        });
        expect(updated.status(), await updated.text()).toBe(200);
        const secondPublish = await page.request.post(`/api/admin/pages/${key}/builder/publish`, {
          headers,
          data: { expectedRevision: (await updated.json()).revision },
        });
        expect(secondPublish.status(), await secondPublish.text()).toBe(200);
        for (const locale of ['en', 'vi']) {
          const path = `/${locale}/${key}`;
          const currentPublic = await page.request.get(`/api/public/pages/${key}?locale=${locale}`);
          const oldPreview = await page.request.get(
            `/api/admin/preview/pages/${key}?locale=${locale}&version=1`,
          );
          expect((await currentPublic.json()).tree).toEqual(nextTree);
          expect((await oldPreview.json()).tree).toEqual(draft.tree);
          await expect(async () => {
            await page.goto(path);
            const currentHash = await page
              .locator('[data-host-block-type="hero"]')
              .getAttribute('data-host-props-hash');
            const resolved = resolveBlockLocale(nextHost.responsive.base, locale as 'en' | 'vi');
            expect(currentHash).toBe(
              createHash('sha256')
                .update(JSON.stringify({ props: resolved.props, lang: resolved.lang }))
                .digest('hex'),
            );
            expect(currentHash).not.toBe(draftRender.get(locale)?.hash);
          }).toPass({ timeout: 30_000 });
          await page.goto(`/api/draft?path=${encodeURIComponent(path)}`);
          await page.goto(`${path}?v=1`);
          expect(
            await page
              .locator('[data-host-block-type="hero"]')
              .getAttribute('data-host-props-hash'),
          ).toBe(draftRender.get(locale)?.hash);
          await page.goto(`/api/draft?exit=1&path=${encodeURIComponent(path)}`);
        }
      }
    });
  }
}
