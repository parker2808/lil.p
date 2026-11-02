import { chromium } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const baseUrl = process.env.DEMO_BASE_URL ?? 'http://localhost:4177';
const colorScheme = process.env.DEMO_COLOR_SCHEME === 'dark' ? 'dark' : 'light';
const routes = [
  ['home', ''],
  ['projects', 'projects'],
  ['case-study', 'projects/particula'],
  ['notes', 'notes'],
  ['note-detail', 'notes/interfaces-as-conversations'],
  ['about', 'about'],
  ['contact', 'contact'],
  ['contact-validation', 'contact'],
  ['contact-success', 'contact'],
  ['craft', 'craft'],
  ['empty', 'demo-state/empty'],
  ['not-found', 'missing-screen'],
  ['error', 'demo-state/error'],
  ...['home', 'projects', 'detail', 'craft', 'notes', 'note', 'about', 'contact'].map((v) => [
    `loading-${v}`,
    `demo-state/${v}`,
  ]),
];
const browser = await chromium.launch({ headless: true });
const issues = [];
for (const locale of ['en', 'vi'])
  for (const width of [1440, 390]) {
    const context = await browser.newContext({
      viewport: { width, height: 900 },
      reducedMotion: 'reduce',
      colorScheme,
    });
    const page = await context.newPage();
    for (const [name, path] of routes) {
      await page.goto(`${baseUrl}/${locale}${path ? `/${path}` : ''}`, {
        waitUntil: 'domcontentloaded',
      });
      if (name === 'contact-validation')
        await page.locator('.demo-contact-form button[type="submit"]').click();
      if (name === 'contact-success') {
        await page.locator('#demo-contact-name').fill('Demo visitor');
        await page
          .locator('#demo-contact-message')
          .fill('A sample idea for the local interface preview.');
        await page.locator('.demo-contact-form button[type="submit"]').click();
      }
      const audit = await page.evaluate(() => {
        const targets = [...document.querySelectorAll('a,button,input,textarea,select')]
          .filter((el) => !el.disabled && getComputedStyle(el).visibility !== 'hidden')
          .map((el) => {
            const r = el.getBoundingClientRect();
            return {
              name: (el.getAttribute('aria-label') ?? el.textContent ?? el.tagName)
                .trim()
                .slice(0, 40),
              width: Math.round(r.width),
              height: Math.round(r.height),
            };
          })
          .filter((r) => r.width && r.height && (r.width < 44 || r.height < 44));
        return {
          h1: document.querySelectorAll('h1').length,
          overflow: document.documentElement.scrollWidth > innerWidth + 1,
          targets,
        };
      });
      const axe = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
        .analyze();
      await page.keyboard.press('Tab');
      const keyboard = await page.evaluate(() => {
        const focused = document.activeElement;
        const outline = focused ? getComputedStyle(focused).outlineStyle : 'none';
        const animated = document.querySelector('.demo-monogram-path, .demo-orbit-path-one');
        const duration = animated
          ? Number.parseFloat(getComputedStyle(animated).animationDuration)
          : 0;
        return {
          focusVisible: !!focused && focused !== document.body && outline !== 'none',
          motionSafe: duration < 0.001,
        };
      });
      const findings = {
        route: `${locale}-${name}-${width}`,
        h1: audit.h1,
        overflow: audit.overflow,
        smallTargets: width === 390 ? audit.targets : [],
        ...keyboard,
        violations: axe.violations.map((v) => ({
          id: v.id,
          impact: v.impact,
          nodes: v.nodes.length,
        })),
      };
      if (
        findings.overflow ||
        (!name.startsWith('loading-') && findings.h1 !== 1) ||
        findings.smallTargets.length ||
        !findings.focusVisible ||
        !findings.motionSafe ||
        findings.violations.length
      )
        issues.push(findings);
      process.stdout.write(
        `${findings.route}: ${findings.violations.length} axe, ${findings.smallTargets.length} targets\n`,
      );
    }
    await context.close();
  }
await browser.close();
process.stdout.write(`AUDIT_ISSUES ${JSON.stringify(issues)}\n`);
if (issues.length) process.exitCode = 1;
