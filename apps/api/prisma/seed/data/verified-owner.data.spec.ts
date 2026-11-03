import { afterEach, describe, expect, it } from 'vitest';

import {
  buildVerifiedOwnerData,
  loadVerifiedOwnerData,
  VERIFIED_PROJECT_SLUGS,
} from './verified-owner.data';

const names = [
  'Particula',
  'CFW Back Office',
  'CFW Sales CRM',
  'MSP Advanced',
  'MSP App Expansion',
  'Migration Data Tool',
  'Even the Stars Know Your Name',
  'Ctrack Crystal',
  'Interview Senior FE',
];
const evidence = `## Experience\nCMC Global Kobizo LitGroup\n## Education\nUniversity of Industry Computer Science\n## Projects\n${names.map((name) => `- **${name}** (Client, 2026-01 to 2026-02): A sourced project summary.`).join('\n')}\n## Skills\n`;

afterEach(() => {
  delete process.env.LILP_PRIVATE_SOURCE_PATH;
});

describe('verified owner content', () => {
  it('fails closed without the env-only private source', () => {
    delete process.env.LILP_PRIVATE_SOURCE_PATH;
    expect(() => loadVerifiedOwnerData()).toThrow('Private content source is required');
  });

  it('rejects missing project evidence', () => {
    expect(() => buildVerifiedOwnerData(evidence.replace(names[8], 'Unknown project'))).toThrow();
    expect(() =>
      buildVerifiedOwnerData(evidence.replace('2026-01 to 2026-02', 'unknown date')),
    ).toThrow();
  });

  it('maps exactly ten unique projects with no inherited metrics', () => {
    const data = buildVerifiedOwnerData(evidence);
    expect(data.projects.map((row) => row.slug)).toEqual(VERIFIED_PROJECT_SLUGS);
    expect(
      data.projects.every((row) => Array.isArray(row.metrics) && row.metrics.length === 0),
    ).toBe(true);
    expect(data.siteSettings.heroStats).toMatchObject([
      { value: '5+' },
      { value: '3' },
      { value: '10+' },
    ]);
    expect(data.siteSettings.contactEmail).toBe('');
    expect(data.profile.phone).toBe('');
  });
});
