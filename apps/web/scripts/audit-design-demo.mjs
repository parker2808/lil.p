import { chromium } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const baseUrl = process.env.DEMO_BASE_URL ?? 'http://localhost:4177';
const colorScheme = process.env.DEMO_COLOR_SCHEME === 'dark' ? 'dark' : 'light';
const widths = [1440, 900, 768, 390, 320];
const routes = [
  ['home', ''],
  ['projects', 'projects'],
  ['case-study', 'projects/particula'],
  ['case-study-field-config', 'projects/cfw-back-office-field-config'],
  ['case-study-asset-rating', 'projects/msp-advanced'],
  ['case-study-store-migrator', 'projects/migration-data-tool'],
  ['case-study-field-sales', 'projects/cfw-sales-crm'],
  ['notes', 'notes'],
  ['note-detail', 'notes/interfaces-as-conversations'],
  ['note-detail-clarity', 'notes/making-space-for-clarity'],
  ['note-detail-motion', 'notes/the-smallest-useful-motion'],
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
  for (const width of widths) {
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
      await page.evaluate(() => document.fonts.ready);
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
        const mediaCards = [
          ...document.querySelectorAll('.redesign-case-card,.demo-experiment,.demo-loading-card'),
        ]
          .map((card) => {
            const cover = card.querySelector(
              'img,[data-slot="cover-placeholder"],.demo-experiment-stage,.demo-loading-card > div:first-child',
            );
            if (!cover) return null;
            const outer = card.getBoundingClientRect();
            if (!outer.width || !outer.height) return null;
            const inner = cover.getBoundingClientRect();
            const inset = inner.left - outer.left;
            const outerRadius = Number.parseFloat(getComputedStyle(card).borderTopLeftRadius);
            const innerRadius = Number.parseFloat(getComputedStyle(cover).borderTopLeftRadius);
            return {
              inset: Math.round(inset),
              rightInset: Math.round(outer.right - inner.right),
              topInset: Math.round(inner.top - outer.top),
              radiusError: Math.round(Math.abs(innerRadius - (outerRadius - inset + 1))),
              caseCard: card.classList.contains('redesign-case-card'),
              featured: !!card.closest('.demo-featured'),
            };
          })
          .filter(
            (card) =>
              card &&
              (card.inset < 10 ||
                (!card.featured && Math.abs(card.inset - card.rightInset) > 2) ||
                card.radiusError > 1 ||
                (card.caseCard && card.topInset < 47)),
          );
        const wrappedBadges = [
          ...document.querySelectorAll('.redesign-case-card [data-slot="badge"]'),
        ]
          .filter((badge) => getComputedStyle(badge).whiteSpace !== 'nowrap')
          .map((badge) => badge.textContent?.trim());
        return {
          h1: document.querySelectorAll('h1').length,
          overflow: document.documentElement.scrollWidth > innerWidth + 1,
          targets,
          mediaCards,
          wrappedBadges,
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
        smallTargets: width <= 390 ? audit.targets : [],
        mediaCards: audit.mediaCards,
        wrappedBadges: audit.wrappedBadges,
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
        findings.mediaCards.length ||
        findings.wrappedBadges.length ||
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
