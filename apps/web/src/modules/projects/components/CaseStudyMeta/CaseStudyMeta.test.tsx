import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

import { CaseStudyMeta } from './CaseStudyMeta';

afterEach(cleanup);

describe('CaseStudyMeta', () => {
  it('shows the summary fields in order and hides missing ones', () => {
    render(
      <CaseStudyMeta
        items={[
          { label: 'Role', value: 'Frontend Engineer' },
          { label: 'Timeline', value: '2024 – 2025' },
          { label: 'Team', value: undefined },
          { label: 'Stack', value: ' ' },
          { label: 'Outcome', value: 'Shipped without downtime' },
        ]}
      />,
    );
    const terms = screen.getAllByRole('term').map((term) => term.textContent);
    expect(terms).toEqual(['Role', 'Timeline', 'Outcome']);
    expect(screen.getByText('Shipped without downtime')).toBeInTheDocument();
  });

  it('renders nothing when every field is empty', () => {
    const { container } = render(
      <CaseStudyMeta
        items={[
          { label: 'Role', value: '' },
          { label: 'Team', value: null },
        ]}
      />,
    );
    expect(container).toBeEmptyDOMElement();
  });
});
