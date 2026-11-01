import { expect, type Page, test } from '@playwright/test';

import { signIn } from './helpers/auth';
import { E2E_USER } from './helpers/credentials';

async function createMessages(page: Page, tag: string, count: number): Promise<void> {
  const origin = new URL(page.url()).origin;
  for (let index = 1; index <= count; index += 1) {
    const response = await page.request.post('/api/public/contact', {
      headers: { Origin: origin },
      data: {
        name: `${tag} ${index}`,
        email: E2E_USER.email,
        message: `Inbox message ${index} from ${tag}`,
        locale: 'en',
      },
    });
    expect(response.ok()).toBeTruthy();
  }
}

const messageList = (page: Page) => page.getByRole('list', { name: 'Messages' });
const row = (page: Page, name: string) =>
  messageList(page).getByRole('link').filter({ hasText: name });

test('reads five messages in a row without leaving the page on desktop', async ({ page }) => {
  await signIn(page);
  const tag = `Reader ${Date.now()}`;
  await createMessages(page, tag, 5);
  await page.goto('/admin/inbox');
  await expect(row(page, `${tag} 5`)).toBeVisible();
  await page.evaluate(() => {
    (window as Window & { inboxDocument?: boolean }).inboxDocument = true;
  });
  const listNode = await messageList(page).elementHandle();

  for (let index = 1; index <= 5; index += 1) {
    const name = `${tag} ${index}`;
    const link = row(page, name);
    await expect(link).toHaveAttribute('data-status', 'NEW');
    await link.click();

    await expect(page).toHaveURL(/\/admin\/inbox\/\d+$/);
    const article = page.locator('article');
    await expect(article.getByRole('heading', { level: 1, name })).toBeVisible();
    await expect(article.getByText(`Inbox message ${index} from ${tag}`)).toBeVisible();
    await expect(link).toHaveAttribute('aria-current', 'page');
    await expect(link).toHaveAttribute('data-status', 'READ');
    await expect(messageList(page)).toBeVisible();
  }

  expect(
    await page.evaluate(() => (window as Window & { inboxDocument?: boolean }).inboxDocument),
  ).toBe(true);
  expect(await listNode!.evaluate((node) => node.isConnected)).toBe(true);
});

test('archive returns to the list and Undo restores the message', async ({ page }) => {
  await signIn(page);
  const name = `Archiver ${Date.now()} 1`;
  await createMessages(page, name.slice(0, -2), 1);
  await page.goto('/admin/inbox');

  await row(page, name).click();
  await expect(page.locator('article').getByRole('heading', { level: 1, name })).toBeVisible();
  await expect(row(page, name)).toHaveAttribute('data-status', 'READ');

  await page.getByRole('button', { name: 'Archive' }).click();
  await expect(page).toHaveURL(/\/admin\/inbox$/);
  await expect(row(page, name)).toHaveCount(0);
  await expect(page.getByText('Message archived')).toBeVisible();

  await page.getByRole('button', { name: 'Undo' }).click();
  await expect(row(page, name)).toHaveAttribute('data-status', 'READ');
  await page.reload();
  await expect(row(page, name)).toHaveAttribute('data-status', 'READ');
});

test.describe('mobile', () => {
  test.use({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true });

  test('opens a message on its own route and Back returns to the list', async ({ page }) => {
    await signIn(page);
    const name = `Mobile ${Date.now()} 1`;
    await createMessages(page, name.slice(0, -2), 1);
    await page.goto('/admin/inbox');
    await expect(page.getByText('Select a message to read it.')).toBeHidden();

    await row(page, name).click();
    await expect(page).toHaveURL(/\/admin\/inbox\/\d+$/);
    await expect(page.locator('article').getByRole('heading', { level: 1, name })).toBeVisible();
    await expect(messageList(page)).toBeHidden();

    await page.goBack();
    await expect(page).toHaveURL(/\/admin\/inbox$/);
    await expect(row(page, name)).toBeVisible();
    await expect(page.locator('article')).toHaveCount(0);

    await row(page, name).click();
    await page.locator('main').getByRole('link', { name: 'Back to Inbox' }).click();
    await expect(page).toHaveURL(/\/admin\/inbox$/);
    await expect(row(page, name)).toBeVisible();
  });
});
