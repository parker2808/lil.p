import { resolve } from 'node:path';

import { expect, type Page, test } from '@playwright/test';

import { signIn } from './helpers/auth';

// `home` and `projects` list records that earlier specs create in the same CI database, so
// their page height drifts; they compare the first screen only. The rest compare full pages.
const PUBLIC_ROUTES = [
  ['home', '/en', false],
  ['projects', '/en/projects', false],
  ['case-study', '/en/projects/particula', true],
  ['notes', '/en/notes', true],
  ['about', '/en/about', true],
  ['contact', '/en/contact', true],
] as const;

const ADMIN_ROUTES = [
  ['profile', '/admin/profile'],
  ['site', '/admin/site'],
  ['post-new', '/admin/posts/new'],
] as const;

const VIEWPORTS = [
  { width: 375, height: 667 },
  { width: 1280, height: 720 },
] as const;

// Baselines are Linux Chromium pixels; `pnpm --filter @portfolio/web test:visual:update` renders them elsewhere.
test.skip(
  process.platform !== 'linux' && !process.env.PW_TEST_CONNECT_WS_ENDPOINT,
  'Visual baselines are rendered by Linux Chromium',
);

async function settle(page: Page): Promise<void> {
  await page.waitForLoadState('networkidle');
  await page.evaluate(async () => {
    for (let y = 0; y < document.documentElement.scrollHeight; y += window.innerHeight) {
      window.scrollTo(0, y);
      await new Promise(requestAnimationFrame);
    }
    window.scrollTo(0, 0);
    await Promise.all(
      Array.from(document.images, (image) => image.decode().catch(() => undefined)),
    );
    await document.fonts.ready;
    // Demo skills share sort orders and are seeded concurrently, so their ID tie-break varies.
    for (const list of document.querySelectorAll<HTMLUListElement>(
      '[data-slot="skill-group"] ul',
    )) {
      list.replaceChildren(
        ...Array.from(list.children).sort((a, b) =>
          (a.textContent ?? '').localeCompare(b.textContent ?? '', 'en'),
        ),
      );
    }
  });
  await page.mouse.move(0, 0);
}

function dynamicParts(page: Page) {
  return [
    page.locator('[data-slot="tech-marquee"]'),
    page.locator('time'),
    page.getByText(/^Saved \d{2}:\d{2}$/),
  ];
}

async function expectScreen(page: Page, name: string, fullPage = true): Promise<void> {
  await settle(page);
  await expect(page).toHaveScreenshot(`${name}.png`, {
    fullPage,
    mask: dynamicParts(page),
    stylePath: resolve(import.meta.dirname, 'visual.css'),
  });
}

async function refreshSeededPage(page: Page, path: string): Promise<void> {
  const response = await page.request.post('/api/revalidate', {
    headers: { 'x-revalidate-secret': process.env.REVALIDATE_SECRET ?? '' },
    data: { tags: ['public'], paths: [path] },
  });
  expect(response.ok()).toBe(true);
}

async function assertCleanDemoContent(page: Page, route: 'notes' | 'about'): Promise<void> {
  if (route === 'notes') {
    const response = await page.request.get('/api/public/posts?locale=en');
    expect(response.ok()).toBe(true);
    const data = (await response.json()) as { total: number; items: { slug: string }[] };
    expect(data.total).toBe(3);
    expect(data.items.map((item) => item.slug).sort()).toEqual([
      'readable-release-notes',
      'strangler-routes',
      'vue-to-react',
    ]);
  } else {
    const [educationResponse, experienceResponse] = await Promise.all([
      page.request.get('/api/public/education?locale=en'),
      page.request.get('/api/public/experience?locale=en'),
    ]);
    expect(educationResponse.ok()).toBe(true);
    expect(experienceResponse.ok()).toBe(true);
    const education = (await educationResponse.json()) as { school: string }[];
    const experience = (await experienceResponse.json()) as { company: string }[];
    expect(education.map((item) => item.school)).toEqual(['Technical University']);
    expect(experience.map((item) => item.company).sort()).toEqual([
      'Acme Platform',
      'Acme Platform',
      'Contoso Commerce',
      'Example Enterprise',
    ]);
  }
}

for (const viewport of VIEWPORTS) {
  test.describe(`${viewport.width}px`, () => {
    test.use({ viewport });

    for (const [name, route, fullPage] of PUBLIC_ROUTES) {
      test(`public ${name}`, async ({ page }) => {
        if (name === 'notes' || name === 'about') await assertCleanDemoContent(page, name);
        await refreshSeededPage(page, route);
        await page.goto(route);
        await expectScreen(page, `public-${name}-${viewport.width}`, fullPage);
      });
    }

    test('admin routes', async ({ page }) => {
      await page.goto('/admin/login');
      await expectScreen(page, `admin-login-${viewport.width}`);

      await signIn(page);
      for (const [name, route] of ADMIN_ROUTES) {
        await page.goto(route);
        await expect(page.locator('main h1').first()).toBeVisible();
        await expectScreen(page, `admin-${name}-${viewport.width}`);
      }
    });
  });
}
