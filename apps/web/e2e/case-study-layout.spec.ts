import { expect, test, type Locator, type Page } from '@playwright/test';

const MAX_CASE_STUDIES = 6;

async function caseStudyPaths(page: Page): Promise<string[]> {
  await page.goto('/en/projects');
  const links = page.locator('.projects-results .redesign-case-card h3 a');
  await expect(links.first()).toBeVisible();
  const hrefs = await links.evaluateAll((anchors) =>
    anchors.map((anchor) => new URL((anchor as HTMLAnchorElement).href).pathname),
  );
  // Other specs create and unpublish `e2e-*` projects in parallel.
  const seeded = hrefs.filter((href) => !/\/projects\/e2e-/.test(href));
  return [...new Set(seeded)].slice(0, MAX_CASE_STUDIES);
}

async function expectEndLinks(page: Page, path: string): Promise<void> {
  const prevNext = page.locator('article nav').filter({ hasText: 'Previous' });
  await expect(prevNext.getByRole('link', { name: /^Previous/ }), path).toBeVisible();
  await expect(prevNext.getByRole('link', { name: /^Next/ }), path).toBeVisible();
  await expect(
    page.locator('article').getByRole('link', { name: 'Get in touch' }),
    path,
  ).toBeVisible();
}

/** Public guards can strip every unfinished section, leaving nothing for a TOC. */
async function hasSections(page: Page): Promise<boolean> {
  return (await page.locator('.case-study-body h2[id]').count()) > 0;
}

/** The heading must sit fully below the sticky header and inside the viewport. */
async function expectHeadingBelowHeader(page: Page, heading: Locator, label: string) {
  const header = page.locator('header.site-header');
  await expect
    .poll(async () => {
      const headerBox = (await header.boundingBox())!;
      const box = (await heading.boundingBox())!;
      const viewport = page.viewportSize()!;
      return box.y >= headerBox.y + headerBox.height && box.y + box.height <= viewport.height;
    }, label)
    .toBe(true);
}

test.describe('case study layout at 1280px', () => {
  test.use({ viewport: { width: 1280, height: 800 } });

  test('summary, progress, sticky TOC and end links on every case study', async ({ page }) => {
    const paths = await caseStudyPaths(page);
    expect(paths.length).toBeGreaterThanOrEqual(2);

    for (const path of paths) {
      await page.goto(path);
      await expect(page.locator('[data-slot="case-study-summary"]'), path).toBeVisible();
      await expect(page.locator('[data-slot="content-progress"]'), path).toHaveCount(1);
      await expect(page.getByRole('button', { name: 'Contents' }), path).toBeHidden();
      await expectEndLinks(page, path);

      const toc = page.locator('aside').getByRole('navigation', { name: 'On this page' });
      if (!(await hasSections(page))) {
        await expect(toc, `${path}: no TOC without sections`).toHaveCount(0);
        continue;
      }
      await expect(toc, path).toBeVisible();
      const tocBox = (await toc.boundingBox())!;
      const bodyBox = (await page.locator('.case-study-body').boundingBox())!;
      expect(tocBox.x, `${path}: TOC on the left`).toBeLessThan(bodyBox.x);

      const links = toc.getByRole('link');
      expect(await links.count(), path).toBeGreaterThan(0);
      for (const link of await links.all()) {
        const id = (await link.getAttribute('href'))!.slice(1);
        await link.click();
        await expectHeadingBelowHeader(page, page.locator(`[id="${id}"]`), `${path}#${id}`);
        await expect(toc, `${path}#${id}: TOC stays in view`).toBeInViewport();
      }
    }
  });
});

test.describe('case study layout at 375px', () => {
  test.use({ viewport: { width: 375, height: 667 }, hasTouch: true, isMobile: true });

  test('Contents sheet opens and closes on link tap on every case study', async ({ page }) => {
    const paths = await caseStudyPaths(page);
    expect(paths.length).toBeGreaterThanOrEqual(2);

    for (const path of paths) {
      await page.goto(path);
      await expect(page.locator('[data-slot="case-study-summary"]'), path).toBeVisible();
      await expect(
        page.locator('aside').getByRole('navigation', { name: 'On this page' }),
        path,
      ).toBeHidden();
      await expectEndLinks(page, path);

      const contents = page.getByRole('button', { name: 'Contents' });
      if (!(await hasSections(page))) {
        await expect(contents, `${path}: no Contents without sections`).toHaveCount(0);
        continue;
      }
      await contents.tap();
      const sheet = page.getByRole('dialog', { name: 'On this page' });
      await expect(sheet, path).toBeVisible();
      const link = sheet.getByRole('navigation', { name: 'Contents' }).getByRole('link').last();
      const id = (await link.getAttribute('href'))!.slice(1);
      await link.tap();
      await expect(sheet, path).toBeHidden();
      await expectHeadingBelowHeader(page, page.locator(`[id="${id}"]`), `${path}#${id}`);
      await expect(page).toHaveURL(new RegExp(`#${id}$`));
    }
  });
});
