import AxeBuilder from '@axe-core/playwright';
import { chromium } from '@playwright/test';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const output = path.join(os.homedir(), 'Desktop/lilp-admin-demo-20261102');
const { routes, loading } = JSON.parse(fs.readFileSync(path.join(output, 'capture-manifest.json')));
const browser = await chromium.launch({ headless: true });
const results = [];
for (const width of [1440, 390]) {
  const context = await browser.newContext({
    viewport: { width, height: width === 390 ? 844 : 900 },
    reducedMotion: 'reduce',
  });
  const page = await context.newPage();
  for (const [route, state] of [
    ...routes.map((route) => [route, '']),
    ...loading.map((route) => [route, 'loading']),
    ['login', 'validation'],
    ['login', 'success'],
    ['inbox', 'empty'],
    ['pages', 'create'],
    ['pages', 'empty'],
  ])
    for (const locale of ['en', 'vi']) {
      const url = `http://localhost:3101/design-demo-admin?screen=${route}&lang=${locale}${state ? `&state=${state}` : ''}`;
      await page.goto(url, { waitUntil: 'load' });
      await page.locator('.demo-root').waitFor();
      const axe = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
        .analyze();
      const layout = await page.evaluate(() => {
        const visible = (el) => {
          const style = getComputedStyle(el);
          const box = el.getBoundingClientRect();
          return (
            style.visibility !== 'hidden' &&
            style.display !== 'none' &&
            box.width > 0 &&
            box.height > 0
          );
        };
        const smallTargets = [...document.querySelectorAll('button, a, input, select')]
          .filter(visible)
          .map((el) => ({
            label:
              el.getAttribute('aria-label') || el.textContent?.trim().slice(0, 40) || el.tagName,
            box: el.getBoundingClientRect(),
          }))
          .filter(({ box }) => box.width < 44 || box.height < 44)
          .map(({ label, box }) => `${label} (${Math.round(box.width)}×${Math.round(box.height)})`);
        return { overflow: document.documentElement.scrollWidth > innerWidth + 1, smallTargets };
      });
      await page.keyboard.press('Tab');
      const keyboard = await page.evaluate(() => ({
        focused: document.activeElement !== document.body,
        focusVisible: document.activeElement?.matches(':focus-visible') ?? false,
        reducedMotion: matchMedia('(prefers-reduced-motion: reduce)').matches,
      }));
      results.push({
        route,
        state,
        locale,
        width,
        violations: axe.violations.map(({ id, nodes }) => `${id}:${nodes.length}`),
        ...layout,
        ...keyboard,
      });
    }
  await context.close();
}
await browser.close();
fs.writeFileSync(path.join(output, 'ux-review.json'), JSON.stringify(results, null, 2));
const failures = results.filter(
  (item) =>
    item.violations.length ||
    item.overflow ||
    (item.width === 390 && item.smallTargets.length) ||
    !item.focused ||
    !item.focusVisible ||
    !item.reducedMotion,
);
console.log(
  `Reviewed ${results.length} route and state views; ${failures.length} with UX findings.`,
);
for (const item of failures)
  console.log(
    `${item.route} ${item.state} ${item.locale} ${item.width}: ${item.violations.join(', ')} ${item.overflow ? 'overflow' : ''} ${item.smallTargets.length && item.width === 390 ? `${item.smallTargets.length} small targets: ${item.smallTargets.slice(0, 4).join('; ')}` : ''} ${!item.focusVisible ? 'focus' : ''}`,
  );
console.log(
  `Mobile controls below 44px: ${results.filter((item) => item.width === 390 && item.smallTargets.length).length} views`,
);
