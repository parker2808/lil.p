import { expect, test } from '@playwright/test';

import { createReviewer, signIn, signOut } from './helpers/auth';
import { E2E_USER } from './helpers/credentials';
import { testRevalidateSecret } from './helpers/secrets';

const TITLE = 'E2E draft case';

test.describe('admin publish', () => {
  test('admin can draft, publish, see public, then archive', async ({ page }) => {
    await signIn(page);
    const origin = new URL(page.url()).origin;
    const slug = `e2e-draft-case-${Date.now()}`;
    const created = await page.request.post('/api/admin/projects', {
      headers: { Origin: origin },
      data: {
        slug,
        titleEn: TITLE,
        titleVi: '',
        taglineEn: 'A short tagline',
        taglineVi: '',
        client: 'Sample client',
        roleEn: 'Frontend Engineer',
        roleVi: '',
        startDate: '2024-01-01',
        problemEn: 'Old path that needed a strangler.',
        problemVi: '',
        constraintsEn: '',
        constraintsVi: '',
        approachEn: '',
        approachVi: '',
        decisionsEn: '',
        decisionsVi: '',
        outcomeEn: '',
        outcomeVi: '',
        lessonsEn: '',
        lessonsVi: '',
        keyFactsEn: '',
        keyFactsVi: '',
        factChipsEn: '',
        factChipsVi: '',
      },
    });
    expect(created.ok(), await created.text()).toBeTruthy();
    const body = (await created.json()) as { id: number };
    await page.goto(`/admin/projects/${body.id}`);

    await expect(page.getByRole('button', { name: 'Publish' })).toBeVisible();
    await page.getByRole('button', { name: 'Publish' }).click();
    await expect(page.getByText('Published', { exact: true }).first()).toBeVisible({
      timeout: 20_000,
    });

    await page.goto(`/en/projects/${slug}`);
    await expect(page.getByRole('heading', { name: TITLE })).toBeVisible();

    const archived = await page.request.delete(`/api/admin/projects/${body.id}`, {
      headers: { Origin: origin },
    });
    expect(archived.ok(), await archived.text()).toBeTruthy();
    const secret = process.env.REVALIDATE_SECRET ?? testRevalidateSecret();
    const revalidated = await page.request.post('/api/revalidate', {
      headers: { 'x-revalidate-secret': secret },
      data: {
        tags: ['projects', `project:${slug}`],
        paths: [`/en/projects/${slug}`, `/vi/projects/${slug}`],
      },
    });
    expect(revalidated.ok(), await revalidated.text()).toBeTruthy();
    const publicAfter = await page.request.get(`/api/public/projects/${slug}?locale=en`);
    expect(publicAfter.status()).toBe(404);

    await page.goto(`/en/projects/${slug}`);
    await expect(page.getByRole('heading', { name: 'This page is missing' })).toBeVisible();
  });

  test('user editor is read-only and hides admin-only chrome', async ({ page }) => {
    await signIn(page);
    await createReviewer(page);
    await signOut(page);
    await signIn(page, E2E_USER);

    await page.goto('/admin/projects');
    await page.getByText('Particula v2').first().dblclick();
    await expect(page).toHaveURL(/\/admin\/projects\/\d+/);
    await expect(page.getByText('Read only')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Publish' })).toHaveCount(0);

    await expect(page.getByRole('link', { name: 'Inbox' })).toHaveCount(0);
    await expect(page.getByRole('link', { name: 'Audit log' })).toHaveCount(0);
    await expect(page.getByRole('link', { name: 'Users' })).toHaveCount(0);
  });
});
