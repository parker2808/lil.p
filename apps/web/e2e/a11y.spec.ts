import { expect, test } from '@playwright/test';

import { signIn } from './helpers/auth';
import { expectNoSeriousAxeIssues } from './helpers/axe';
import { E2E_USER } from './helpers/credentials';

const publicScreens = [
  { name: 'home', path: '/en' },
  { name: 'about', path: '/en/about' },
  { name: 'projects', path: '/en/projects' },
  { name: 'case study', path: '/en/projects/particula' },
  { name: 'notes', path: '/en/notes' },
  { name: 'post', path: '/en/notes/vue-to-react' },
  { name: 'contact', path: '/en/contact' },
] as const;

const inlineListRoutes = [
  'skills',
  'tags',
  'education',
  'principles',
  'process',
  'stats',
  'domains',
] as const;

const adminRoutes = [
  'site',
  'profile',
  'users',
  'media',
  'pages',
  'audit',
  'analytics',
  'projects',
  'posts',
  'inbox',
  'experience',
] as const;

const editorRoutes = ['projects', 'posts', 'experience'] as const;

test.describe('axe', () => {
  for (const screen of publicScreens) {
    test(`${screen.name} has no serious or critical issues`, async ({ page }) => {
      await page.goto(screen.path);
      await expect(page.locator('main#content')).toBeVisible();
      await expectNoSeriousAxeIssues(page);
    });
  }

  test('admin login has no serious or critical issues', async ({ page }) => {
    await page.goto('/admin/login');
    await expect(page.getByRole('heading', { name: 'Sign in' })).toBeVisible();
    await expectNoSeriousAxeIssues(page);
  });

  test('admin dashboard has no serious or critical issues', async ({ page }) => {
    await signIn(page);
    await page.goto('/admin');
    await expect(page.locator('main#content')).toBeVisible();
    await expectNoSeriousAxeIssues(page);
  });

  test('page builder has no serious or critical issues', async ({ page }) => {
    await signIn(page);
    await page.goto('/admin/pages/home');
    await expect(page.getByRole('heading', { name: /home/i }).first()).toBeVisible();
    await expectNoSeriousAxeIssues(page);
  });

  for (const route of inlineListRoutes) {
    test(`admin ${route} has no serious or critical issues`, async ({ page }) => {
      await signIn(page);
      await page.goto(`/admin/${route}`);
      await expect(page.locator('main#content h1').first()).toBeVisible();
      await expect(
        page.getByRole('button', { name: /^Edit the active row:/ }).first(),
      ).toBeVisible();
      await expectNoSeriousAxeIssues(page);
    });
  }

  for (const route of adminRoutes) {
    test(`admin ${route} has no serious or critical issues`, async ({ page }) => {
      await signIn(page);
      await page.goto(`/admin/${route}`);
      await expect(page.locator('main#content h1').first()).toBeVisible();
      await expectNoSeriousAxeIssues(page);
    });
  }

  for (const route of editorRoutes) {
    test(`admin ${route} new and edit have no serious or critical issues`, async ({ page }) => {
      await signIn(page);
      const response = await page.request.get(`/api/admin/${route}`);
      expect(response.ok()).toBeTruthy();
      const list = (await response.json()) as { items: Array<{ id: number }> };
      expect(list.items.length).toBeGreaterThan(0);
      for (const path of [`/admin/${route}/new`, `/admin/${route}/${list.items[0]!.id}`]) {
        await page.goto(path);
        await expect(page.locator('main#content')).toBeVisible();
        await expectNoSeriousAxeIssues(page);
      }
    });
  }

  test('admin inbox detail has no serious or critical issues', async ({ page }) => {
    await signIn(page);
    const response = await page.request.post('/api/public/contact', {
      headers: { Origin: new URL(page.url()).origin },
      data: {
        name: 'Axe Visitor',
        email: E2E_USER.email,
        message: 'Accessibility test message',
        locale: 'en',
      },
    });
    expect(response.ok()).toBeTruthy();
    const messages = await page.request.get('/api/admin/messages');
    expect(messages.ok()).toBeTruthy();
    const list = (await messages.json()) as { items: Array<{ id: number }> };
    expect(list.items.length).toBeGreaterThan(0);
    await page.goto(`/admin/inbox/${list.items[0]!.id}`);
    await expect(page.locator('main#content h1')).toBeVisible();
    await expectNoSeriousAxeIssues(page);
  });
});

test.describe('reduced motion', () => {
  test.use({ reducedMotion: 'reduce' });

  test('home orbs stop and the marquee becomes a static row', async ({ page }) => {
    await page.goto('/en');
    const orb = page.locator('.orb').first();
    if ((await orb.count()) > 0) {
      await expect(orb).toHaveCSS('animation-name', 'none');
    }
    const marquee = page.locator('[data-slot="tech-marquee"]');
    if ((await marquee.count()) > 0) {
      await expect(marquee).toHaveAttribute('data-static', '');
    }
  });
});

test.describe('keyboard', () => {
  test('admin skip link is the first tab stop', async ({ page }) => {
    await signIn(page);
    await page.goto('/admin');
    await page.keyboard.press('Tab');
    await expect(page.getByRole('link', { name: 'Skip to content' })).toBeFocused();
    await page.keyboard.press('Enter');
    await expect(page.locator('main#content')).toBeFocused();
  });

  test('page builder drag handle is reachable from the keyboard', async ({ page }) => {
    await signIn(page);
    await page.goto('/admin/pages/home');
    const handle = page.getByRole('button', { name: 'Drag to reorder' }).first();
    await expect(handle).toBeVisible();
    await handle.focus();
    await expect(handle).toBeFocused();
  });
});
