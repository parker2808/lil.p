import { expect, test, type Page } from '@playwright/test';

const MAX_CASE_STUDIES = 6;

/** Every cover fallback's visible text box must sit inside its frame; returns the frame count. */
async function expectCoversInsideFrame(page: Page): Promise<number> {
  await page.locator('article, .projects-results').first().waitFor();
  const covers = page.locator('.redesign-cover-placeholder');
  const clipped = await covers.evaluateAll((frames) =>
    frames.flatMap((frame) => {
      const outer = frame.getBoundingClientRect();
      if (outer.width === 0) return [];
      return Array.from(frame.querySelectorAll('span'))
        .filter((span) => span.textContent?.trim())
        .flatMap((span) => {
          const range = document.createRange();
          range.selectNodeContents(span);
          const text = range.getBoundingClientRect();
          const box = span.getBoundingClientRect();
          const clipsSelf = getComputedStyle(span).overflow === 'hidden';
          const left = clipsSelf ? Math.max(text.left, box.left) : text.left;
          const right = clipsSelf ? Math.min(text.right, box.right) : text.right;
          const inside =
            left >= outer.left - 1 &&
            right <= outer.right + 1 &&
            text.top >= outer.top - 1 &&
            text.bottom <= outer.bottom + 1;
          return inside ? [] : [`${span.className} "${span.textContent}"`];
        });
    }),
  );
  expect(clipped, page.url()).toEqual([]);
  return covers.count();
}

async function caseStudyPaths(page: Page): Promise<string[]> {
  await page.goto('/en/projects');
  const links = page.locator('.projects-results .redesign-case-card h3 a');
  await expect(links.first()).toBeVisible();
  const hrefs = await links.evaluateAll((anchors) =>
    anchors.map((anchor) => new URL((anchor as HTMLAnchorElement).href).pathname),
  );
  // Skip records other specs create and unpublish in parallel (e.g. `e2e-draft-case-*`):
  // the cached public list can still link them for a moment after they become drafts.
  const seeded = hrefs.filter((href) => !/\/projects\/e2e-/.test(href));
  return [...new Set(seeded)].slice(0, MAX_CASE_STUDIES);
}

test('every case study ends with previous/next links and a contact CTA', async ({ page }) => {
  const paths = await caseStudyPaths(page);
  expect(paths.length).toBeGreaterThanOrEqual(2);

  for (const path of paths) {
    await page.goto(path);
    const prevNext = page.locator('article nav').filter({ hasText: 'Previous' });
    const previous = prevNext.getByRole('link', { name: /^Previous/ });
    const next = prevNext.getByRole('link', { name: /^Next/ });
    await expect(previous, path).toHaveAttribute('href', /\/en\/projects\/[^/]+$/);
    await expect(next, path).toHaveAttribute('href', /\/en\/projects\/[^/]+$/);
    expect(await previous.getAttribute('href')).not.toBe(path);
    expect(await next.getAttribute('href')).not.toBe(path);

    const cta = page.locator('article').getByRole('link', { name: 'Get in touch' });
    await expect(cta, path).toHaveAttribute('href', '/en/contact');
    const navBox = (await prevNext.boundingBox())!;
    const ctaBox = (await cta.boundingBox())!;
    expect(ctaBox.y, path).toBeGreaterThan(navBox.y + navBox.height);
  }
});

test('the Vietnamese case study CTA links to the Vietnamese contact page', async ({ page }) => {
  const [path] = await caseStudyPaths(page);
  await page.goto(path!.replace(/^\/en\//, '/vi/'));
  await expect(
    page.locator('article').getByRole('link', { name: 'Liên hệ', exact: true }),
  ).toHaveAttribute('href', '/vi/contact');
});

for (const viewport of [
  { width: 1440, height: 900 },
  { width: 375, height: 667 },
]) {
  test(`cover fallbacks are not clipped at ${viewport.width}px`, async ({ page }) => {
    await page.setViewportSize(viewport);
    const paths = await caseStudyPaths(page);
    expect(await expectCoversInsideFrame(page)).toBeGreaterThan(0);

    await page.goto('/en/projects?view=index');
    expect(await expectCoversInsideFrame(page)).toBeGreaterThan(0);

    let caseStudyCovers = 0;
    for (const path of paths) {
      await page.goto(path);
      caseStudyCovers += await expectCoversInsideFrame(page);
    }
    expect(caseStudyCovers).toBeGreaterThan(0);
  });
}
