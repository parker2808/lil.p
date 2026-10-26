import { describe, expect, it } from 'vitest';

import type { AdminProject } from '@portfolio/contracts';

import {
  countLines,
  emptyProjectForm,
  projectToForm,
  slugifyTitle,
  toCreateInput,
} from './project-form.util';

describe('project form utils', () => {
  it('slugifies a title', () => {
    expect(slugifyTitle('Payment Ledger v2')).toBe('payment-ledger-v2');
  });

  it('counts non-empty lines', () => {
    expect(countLines('one\n\ntwo\n')).toBe(2);
  });

  it('drops editor-only fields from the create payload', () => {
    const values = { ...emptyProjectForm(), id: 9, status: 'DRAFT' as const, updatedAt: 'now' };
    const input = toCreateInput(values);
    expect(input).not.toHaveProperty('id');
    expect(input).not.toHaveProperty('status');
    expect(input).not.toHaveProperty('updatedAt');
    expect(input).not.toHaveProperty('publishedAt');
    expect(input.notMineEn).toBeNull();
    expect(input.releaseStatus).toBeNull();
  });

  it('keeps notMine and releaseStatus when mapping an existing project', () => {
    const project = {
      ...emptyProjectForm(),
      id: 4,
      status: 'DRAFT',
      publishedAt: '2026-01-01T00:00:00.000Z',
      sortOrder: 2,
      updatedAt: '2026-01-02T00:00:00.000Z',
      startDate: '2024-03-01T00:00:00.000Z',
      notMineEn: 'Teammate owned the API.',
      notMineVi: 'TODO',
      releaseStatus: { released: ['web'], notReleased: ['admin'] },
      skillIds: [1],
      metrics: [
        {
          id: 8,
          labelEn: 'Latency',
          labelVi: 'Độ trễ',
          before: '800ms',
          after: '120ms',
          value: '6.7x',
          sortOrder: 0,
        },
      ],
    } as AdminProject;
    const form = projectToForm(project);
    expect(form.notMineEn).toBe('Teammate owned the API.');
    expect(form.releaseStatus).toEqual({ released: ['web'], notReleased: ['admin'] });
    expect(form.startDate).toBe('2024-03-01');
    expect(form.metrics?.[0]).not.toHaveProperty('id');
    expect(toCreateInput(form)).not.toHaveProperty('publishedAt');
    expect(toCreateInput(form).notMineEn).toBe('Teammate owned the API.');
  });
});
