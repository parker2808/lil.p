import { describe, expect, it } from 'vitest';

import { toPublicProfile } from './profile.mapper';

const row = {
  id: 1,
  displayName: 'Parker Vu',
  legalName: 'Vu Van Hung',
  city: 'Hanoi',
  country: 'Vietnam',
  timezone: 'Asia/Ho_Chi_Minh',
  careerStartDate: new Date('2021-01-01'),
  headlineEn: 'Hello',
  headlineVi: 'Xin chào',
  subheadlineEn: 'Line',
  subheadlineVi: 'Dòng',
  bioEn: 'Bio',
  bioVi: 'Tiểu sử',
  languagesEn: 'English',
  languagesVi: 'Tiếng Việt',
  heroKickerEn: 'Kicker',
  heroKickerVi: 'Kicker VI',
  headlineAccentEn: 'Hello',
  headlineAccentVi: 'Xin chào',
  resumeEnId: null,
  resumeViId: null,
  phone: '<phone>',
  updatedAt: new Date('2026-01-01'),
};

describe('toPublicProfile', () => {
  it('never includes phone', () => {
    const dto = toPublicProfile(row, 'en');
    expect(dto).not.toHaveProperty('phone');
    expect(JSON.stringify(dto)).not.toMatch(/phone/i);
  });
});
