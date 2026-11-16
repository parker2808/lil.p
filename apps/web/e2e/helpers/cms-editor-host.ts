import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';

import { BLOCK_REGISTRY, resolveBlockLocale } from '@portfolio/contracts';
import { expect, test } from '@playwright/test';

import viMessages from '../../i18n/locales/vi.json' with { type: 'json' };
import { BLOCK_EDITOR_META } from '../../src/modules/admin-pages/constants/block-editor-meta.constant';
import { signIn } from './auth';
import { captureEditorHostVisuals } from './cms-editor-visual';

export function registerEditorHostJourney(shard: number): void {
  const definitions = Object.values(BLOCK_REGISTRY);
  expect(definitions).toHaveLength(20);
  for (const definition of definitions.slice((shard - 1) * 5, shard * 5)) {
    test(`${definition.type}: palette, Properties, autosave and EN/VI preview/public parity`, async ({
      page,
      context,
    }, testInfo) => {
      test.setTimeout(360_000);
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
      const addHeading = inspector.getByRole('button', {
        name: /^(?:Thêm tiêu đề|Thêm · Tiêu đề mục)$/,
      });
      const headingAdded = (await addHeading.count()) > 0;
      if (headingAdded) await addHeading.click();

      const englishValue = `Edited ${definition.type}`;
      const vietnameseValue = `Sửa ${definition.type}`;
      const draftPath = `/api/admin/pages/${key}/builder/draft`;
      if (['notes-browser', 'projects-browser'].includes(definition.type)) {
        const showFeaturedLabel =
          definition.type === 'notes-browser'
            ? viMessages.admin.blocks.notesBrowser.showFeatured
            : viMessages.admin.blocks.projectsBrowser.showFeatured;
        await inspector.getByRole('switch', { name: showFeaturedLabel }).click();
      } else {
        const headingEnglish = inspector.getByRole('textbox', {
          name: /^(?:heading title \(EN\)|Tiêu đề mục · Tiêu đề · Tiếng Anh)$/,
        });
        const headingVietnamese = inspector.getByRole('textbox', {
          name: /^(?:heading title \(VI\)|Tiêu đề mục · Tiêu đề · Tiếng Việt)$/,
        });
        if (headingAdded) {
          await expect(headingEnglish).toHaveCount(1);
          await expect(headingVietnamese).toHaveCount(1);
        }
        const english = (await headingEnglish.count())
          ? headingEnglish
          : inspector.getByRole('textbox', { name: /(?:\(EN\)|· Tiếng Anh)$/ }).first();
        const vietnamese = (await headingVietnamese.count())
          ? headingVietnamese
          : inspector.getByRole('textbox', { name: /(?:\(VI\)|· Tiếng Việt)$/ }).first();
        await expect(english).toBeVisible();
        await english.fill(englishValue);
        await expect
          .poll(
            async () => {
              const response = await page.request.get(draftPath);
              if (response.status() !== 200) return false;
              const body = await response.json();
              const host = body.tree?.root.sections[0]?.content.find(
                (node: { componentType?: string }) => node.componentType === definition.type,
              );
              return (
                Number(body.revision) > 1 &&
                JSON.stringify(host?.responsive.base ?? {}).includes(englishValue)
              );
            },
            { timeout: 30_000 },
          )
          .toBe(true);
        await vietnamese.fill(vietnameseValue);
      }

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
      await captureEditorHostVisuals(
        page,
        context,
        testInfo,
        key,
        definition.type,
        savedHost.id,
        draft.revision,
      );
      const afterCapture = await page.request.get(draftPath);
      expect(afterCapture.status()).toBe(200);
      expect(await afterCapture.json()).toMatchObject({
        revision: draft.revision,
        tree: draft.tree,
      });
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
      const version = (await published.json()).publishedVersion as number;
      expect(version).toBe(1);
      const snapshot = await page.request.get(`/api/admin/pages/${key}/versions/${version}`);
      expect(snapshot.status(), await snapshot.text()).toBe(200);
      expect((await snapshot.json()).snapshot.tree).toEqual(draft.tree);
      const renderEntries: Array<{
        locale: 'en' | 'vi';
        theme: 'light' | 'dark';
        width: 390 | 768 | 1440;
        surface: 'public' | 'preview';
        screenshotSha256: string;
        hostPropsHash: string;
      }> = [];

      for (const locale of ['en', 'vi'] as const) {
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
        const editedText = draftRender.get(locale)?.editedText;
        const path = `/${locale}/${key}`;
        for (const theme of ['light', 'dark'] as const) {
          await page.evaluate((value) => localStorage.setItem('theme', value), theme);
          await page.emulateMedia({ colorScheme: theme, reducedMotion: 'reduce' });
          for (const surface of ['public', 'preview'] as const) {
            if (surface === 'preview') {
              await page.goto(`/api/draft?path=${encodeURIComponent(path)}`);
            }
            await page.goto(surface === 'public' ? path : `${path}?v=${version}`);
            await expect(page.locator('html')).toHaveAttribute('lang', locale);
            await expect(page.locator('html')).toHaveClass(new RegExp(`\\b${theme}\\b`));
            const host = page.locator(`[data-host-block-type="${definition.type}"]`);
            await expect(host).toHaveCount(1);
            const hostPropsHash = await host.getAttribute('data-host-props-hash');
            expect(hostPropsHash).toMatch(/^[a-f0-9]{64}$/);
            expect(hostPropsHash).toBe(draftRender.get(locale)?.hash);
            if (editedText) await expect(host).toContainText(editedText);
            for (const width of [390, 768, 1440] as const) {
              await page.setViewportSize({ width, height: 900 });
              const hostBox = await host.boundingBox();
              if (hostBox && hostBox.width > 0 && hostBox.height > 0) {
                await host.scrollIntoViewIfNeeded();
              }
              const image = await page.screenshot({ animations: 'disabled' });
              await testInfo.attach(
                `${definition.type}-${locale}-${theme}-${width}-${surface}.png`,
                {
                  body: image,
                  contentType: 'image/png',
                },
              );
              renderEntries.push({
                locale,
                theme,
                width,
                surface,
                screenshotSha256: createHash('sha256').update(image).digest('hex'),
                hostPropsHash: hostPropsHash!,
              });
            }
            if (surface === 'preview') {
              await page.goto(`/api/draft?exit=1&path=${encodeURIComponent(path)}`);
            }
          }
        }
      }
      expect(renderEntries).toHaveLength(24);
      await testInfo.attach(`${definition.type}-v05-revision-chain.json`, {
        body: Buffer.from(
          JSON.stringify({
            sourceHead: process.env.E2E_SOURCE_HEAD_SHA ?? null,
            checkoutSha: execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim(),
            ciRunId: process.env.GITHUB_RUN_ID ?? null,
            componentType: definition.type,
            draftRevision: draft.revision,
            publishedVersion: version,
            treeSha256: createHash('sha256').update(JSON.stringify(draft.tree)).digest('hex'),
            entries: renderEntries,
          }),
        ),
        contentType: 'application/json',
      });
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
