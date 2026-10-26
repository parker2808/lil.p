import { processStepFixtures, skillChipFixtures } from '@portfolio/contracts';
import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { MigrationDiagram } from './MigrationDiagram';

function mockMatchMedia(reduced: boolean) {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: (query: string) => ({
      matches: query.includes('reduce') ? reduced : false,
      media: query,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    }),
  });
}

describe('MigrationDiagram', () => {
  it('announces one image and lists the nodes in sr-only text', () => {
    mockMatchMedia(true);
    render(
      <MigrationDiagram
        versionFrom="v1"
        versionTo="v2"
        skills={skillChipFixtures.slice(0, 3)}
        label="Migration from v1 to v2"
      />,
    );

    expect(screen.getByRole('img', { name: 'Migration from v1 to v2' })).toBeInTheDocument();
    expect(screen.getByText(/v1, Vue, Nuxt, TypeScript, v2/)).toBeInTheDocument();
  });

  it('falls back to a vertical process chain when versions are missing', () => {
    mockMatchMedia(true);
    render(
      <MigrationDiagram fallbackSteps={processStepFixtures} label="How a frontend is migrated" />,
    );

    expect(screen.getByRole('img', { name: 'How a frontend is migrated' })).toBeInTheDocument();
    expect(screen.getByText('Audit')).toBeInTheDocument();
    expect(document.querySelector('[data-mode="chain"]')).not.toBeNull();
  });

  it('does not spin the orbit under reduced motion', () => {
    mockMatchMedia(true);
    render(
      <MigrationDiagram
        versionFrom="v1"
        versionTo="v2"
        skills={skillChipFixtures.slice(0, 3)}
        label="Migration"
      />,
    );
    expect(document.querySelector('.diagram-orbit')).toHaveAttribute('data-reduced', 'true');
  });
});
