import {
  confidentialProjectFixture,
  overflowProjectFixture,
  projectFixture,
} from '@portfolio/contracts';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { CaseCard } from './CaseCard';

describe('CaseCard', () => {
  it('has a single tab stop that is the title link', () => {
    render(
      <CaseCard
        project={projectFixture}
        href="/projects/sample-migration"
        labels={{ nda: 'NDA' }}
      />,
    );

    const links = screen.getAllByRole('link');
    expect(links).toHaveLength(1);
    expect(links[0]).toHaveTextContent(projectFixture.title);
    expect(links[0]).toHaveAttribute('href', '/projects/sample-migration');
  });

  it('renders a cover with srcset and alt', () => {
    render(
      <CaseCard
        project={{
          ...projectFixture,
          cover: {
            url: 'https://media.test/cover',
            srcset: 'https://media.test/cover?w=480&f=webp 480w',
            width: 1600,
            height: 900,
            alt: 'Ledger cover',
          },
        }}
        href="/projects/sample-migration"
        labels={{ nda: 'NDA' }}
      />,
    );
    const image = screen.getByRole('img', { name: 'Ledger cover' });
    expect(image).toHaveAttribute('srcset', expect.stringContaining('480w'));
    expect(image).toHaveAttribute('width', '1600');
    expect(image).toHaveAttribute('height', '900');
  });

  it('shows the NDA pill and chip overflow', () => {
    const { rerender } = render(
      <CaseCard
        project={confidentialProjectFixture}
        href="/projects/sample-nda"
        labels={{ nda: 'NDA' }}
      />,
    );
    expect(screen.getByText('NDA')).toBeInTheDocument();

    rerender(
      <CaseCard
        project={overflowProjectFixture}
        href="/projects/sample-overflow"
        labels={{ nda: 'NDA' }}
      />,
    );
    expect(screen.getByText('+1')).toBeInTheDocument();
  });
});
