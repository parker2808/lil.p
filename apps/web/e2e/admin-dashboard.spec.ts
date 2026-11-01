import { expect, test, type Page } from '@playwright/test';

import { signIn } from './helpers/auth';

const CARDS = [
  ['Unread messages', /^\/admin\/inbox(\?status=NEW)?$/],
  ['Unpublished drafts', /^\/admin\/(projects|posts)\?status=DRAFT$/],
  [/^Page views · 30d$/, /^\/admin\/analytics$/],
  ['Recent activity', /^\/admin\/audit$/],
] as const;

type Box = { x: number; y: number; width: number; height: number };

async function gridLayout(page: Page) {
  return page.locator('[data-slot="dashboard-grid"]').evaluate((grid) => {
    const box = (element: Element) => {
      const { x, y, width, height } = element.getBoundingClientRect();
      return { x, y, width, height };
    };
    return {
      grid: box(grid),
      cells: Array.from(grid.children, (cell) => ({
        cell: box(cell),
        content: cell.firstElementChild ? box(cell.firstElementChild) : null,
        text: (cell as HTMLElement).innerText.trim(),
      })),
    };
  });
}

function rows(cells: Array<{ cell: Box }>) {
  const byTop = new Map<number, Box[]>();
  for (const { cell } of cells) {
    const top = Math.round(cell.y);
    byTop.set(top, [...(byTop.get(top) ?? []), cell]);
  }
  return [...byTop.values()];
}

test('dashboard action cards link to their lists and fill the grid at 375 and 1280', async ({
  page,
}) => {
  test.setTimeout(120_000);
  await signIn(page);

  for (const width of [375, 1280]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/admin');

    for (const [name, target] of CARDS) {
      const card = page.getByRole('region', { name });
      await expect(card, `${width}px ${name}`).toBeVisible();
      const href = await card.getByRole('link').first().getAttribute('href');
      expect(href, `${width}px ${name}`).toMatch(target);
      const response = await page.request.get(href!);
      expect(response.ok(), `${width}px ${href}`).toBeTruthy();
    }
    await expect(page.getByText('Content health', { exact: true })).toBeVisible();

    const { grid, cells } = await gridLayout(page);
    expect(cells, `${width}px cells`).toHaveLength(5);
    for (const { cell, content, text } of cells) {
      expect(text.length, `${width}px cell text`).toBeGreaterThan(0);
      expect(content, `${width}px cell content`).not.toBeNull();
      expect(Math.abs(content!.height - cell.height), `${width}px cell fill`).toBeLessThanOrEqual(
        1,
      );
    }
    for (const row of rows(cells)) {
      const left = Math.min(...row.map((cell) => cell.x));
      const right = Math.max(...row.map((cell) => cell.x + cell.width));
      expect(Math.abs(left - grid.x), `${width}px row start`).toBeLessThanOrEqual(1);
      expect(Math.abs(right - (grid.x + grid.width)), `${width}px row end`).toBeLessThanOrEqual(1);
    }
    expect(rows(cells), `${width}px row count`).toHaveLength(width === 375 ? 5 : 2);
  }
});
