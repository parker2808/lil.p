import { expect, type Page, test } from '@playwright/test';

import { signIn } from './helpers/auth';
import { expectNoSeriousAxeIssues } from './helpers/axe';
import { testRevalidateSecret } from './helpers/secrets';

const STATS = [
  { value: '5', suffix: '+', labelEn: 'Years shipping', labelVi: 'Năm triển khai' },
  { value: '12', suffix: '', labelEn: 'Products launched', labelVi: 'Sản phẩm ra mắt' },
];

type ProfileStat = { value: string; suffix: string | null; label: string };

async function revalidateSite(page: Page): Promise<void> {
  const response = await page.request.post('/api/revalidate', {
    headers: { 'x-revalidate-secret': process.env.REVALIDATE_SECRET ?? testRevalidateSecret() },
    data: { tags: ['site'], paths: ['/en', '/vi'] },
  });
  expect(response.ok(), await response.text()).toBeTruthy();
}

async function heroStats(page: Page, path: string): Promise<string[]> {
  await page.goto(path);
  return page
    .locator('.hero-copy dl.hero-stats > div')
    .evaluateAll((items) =>
      items.map(
        (item) =>
          `${item.querySelector('dt')?.textContent}=${item.querySelector('dd')?.textContent}`,
      ),
    );
}

async function saveSettings(page: Page, action: () => Promise<void>): Promise<void> {
  const saved = page.waitForResponse(
    (response) =>
      response.url().endsWith('/api/admin/site') && response.request().method() === 'PATCH',
  );
  await action();
  expect((await saved).status()).toBe(200);
  await revalidateSite(page);
}

test.describe('hero stats from site settings', () => {
  test('admin sets two stats, the hero shows them, and Clear restores profile stats', async ({
    page,
  }) => {
    await signIn(page);
    await page.goto('/admin/site');
    const fieldset = page.getByRole('group', { name: 'Hero stats' });
    await expect(fieldset).toBeVisible();

    await fieldset.getByRole('button', { name: 'Add stat' }).click();
    await fieldset.getByRole('button', { name: 'Add stat' }).click();
    await page.getByRole('button', { name: 'Save', exact: true }).click();
    await expect(fieldset.getByText('Required').first()).toBeVisible();
    await expect(fieldset.getByLabel('Value').first()).toBeFocused();

    for (const [index, stat] of STATS.entries()) {
      const row = fieldset.getByRole('group', { name: `Stat ${index + 1}` });
      await row.getByLabel('Value').fill(stat.value);
      await row.getByLabel('Suffix').fill(stat.suffix);
      await row.getByLabel('Label (EN)').fill(stat.labelEn);
      await row.getByLabel('Label (VI)').fill(stat.labelVi);
    }
    await expect(fieldset.getByText('Required')).toHaveCount(0);
    await saveSettings(page, () => page.getByRole('button', { name: 'Save', exact: true }).click());

    await expectNoSeriousAxeIssues(page);

    expect(await heroStats(page, '/vi')).toEqual(['Năm triển khai=5+', 'Sản phẩm ra mắt=12']);
    await expectNoSeriousAxeIssues(page);
    expect(await heroStats(page, '/en')).toEqual(['Years shipping=5+', 'Products launched=12']);

    await page.goto('/admin/site');
    await expect(page.getByRole('group', { name: 'Stat 2' }).getByLabel('Label (EN)')).toHaveValue(
      STATS[1]!.labelEn,
    );
    await saveSettings(page, () =>
      page.getByRole('button', { name: 'Clear (use profile stats)' }).click(),
    );
    await expect(page.getByRole('group', { name: 'Stat 1' })).toHaveCount(0);

    const site = (await (await page.request.get('/api/public/site?locale=en')).json()) as {
      settings: { heroStats: unknown };
      profileStats: ProfileStat[];
    };
    expect(site.settings.heroStats).toBeNull();
    const fallback = site.profileStats
      .filter((stat) => !/^0(?:[.,]0+)?$/.test(stat.value.trim()))
      .slice(0, 3)
      .map((stat) => `${stat.label}=${stat.value}${stat.suffix ?? ''}`);
    expect(fallback.length).toBeGreaterThan(0);
    expect(await heroStats(page, '/en')).toEqual(fallback);
  });
});
