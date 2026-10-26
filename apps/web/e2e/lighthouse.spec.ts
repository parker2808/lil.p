import { expect, test } from '@playwright/test';

import { runMobileLighthouse } from './helpers/lighthouse';

const pages = [
  { name: 'home', path: '/en', minPerformance: 70 },
  { name: 'projects', path: '/en/projects', minPerformance: 70 },
  { name: 'case study', path: '/en/projects/particula', minPerformance: 70 },
  { name: 'post', path: '/en/notes/vue-to-react', minPerformance: 70 },
] as const;

test.describe('lighthouse mobile', () => {
  test.describe.configure({ timeout: 120_000 });

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
      expect(
        scores.performance,
        `${screen.name} performance ${scores.performance}`,
      ).toBeGreaterThanOrEqual(screen.minPerformance);
    });
  }
});
