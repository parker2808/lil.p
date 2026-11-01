import { expect, test } from '@playwright/test';

import { runMobileLighthouse } from './helpers/lighthouse';

const pages = [
  { name: 'home', path: '/en' },
  { name: 'projects', path: '/en/projects' },
  { name: 'case study', path: '/en/projects/particula' },
  { name: 'post', path: '/en/notes/vue-to-react' },
] as const;

const minPerformance = process.env.GITHUB_ACTIONS ? 0 : 70;

test.describe('lighthouse mobile', () => {
  test.describe.configure({ timeout: 120_000 });

  test('/vi total blocking time is at most 300 ms', async ({ baseURL }) => {
    const scores = await runMobileLighthouse(new URL('/vi', baseURL).toString());
    expect(scores.totalBlockingTime).toBeLessThanOrEqual(300);
  });

  test('/vi/projects cumulative layout shift is at most 0.1', async ({ baseURL }) => {
    const scores = await runMobileLighthouse(new URL('/vi/projects', baseURL).toString());
    expect(scores.cumulativeLayoutShift).toBeLessThanOrEqual(0.1);
  });

  for (const screen of pages) {
    test(`${screen.name} meets accessibility and performance floors`, async ({ baseURL }) => {
      const scores = await runMobileLighthouse(new URL(screen.path, baseURL).toString());
      console.log(
        `lighthouse ${screen.name}: accessibility ${scores.accessibility}, performance ${scores.performance}`,
      );
      expect(
        scores.accessibility,
        `${screen.name} accessibility ${scores.accessibility}`,
      ).toBeGreaterThanOrEqual(95);
      if (minPerformance > 0) {
        expect(
          scores.performance,
          `${screen.name} performance ${scores.performance}`,
        ).toBeGreaterThanOrEqual(minPerformance);
      }
    });
  }
});
