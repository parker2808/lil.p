import { profileStatFixtures } from '@portfolio/contracts';
import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { StatBand } from './StatBand';

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

describe('StatBand', () => {
  it('hides with fewer than two stats', () => {
    const { container } = render(<StatBand stats={profileStatFixtures.slice(0, 1)} />);
    expect(container).toBeEmptyDOMElement();
  });

  it('keeps the final value in the accessible name', () => {
    mockMatchMedia(true);
    render(<StatBand stats={profileStatFixtures.slice(0, 2)} />);
    expect(screen.getByLabelText('5+ Years shipping')).toBeInTheDocument();
    expect(screen.getByLabelText('4 Products shipped')).toBeInTheDocument();
  });
});

it('renders final numbers on the server and omits zero statistics', async () => {
  const { renderToStaticMarkup } = await import('react-dom/server');
  const stats = [
    ...profileStatFixtures.slice(0, 2),
    { ...profileStatFixtures[0]!, id: 999, value: '0', label: 'Empty metric' },
  ];
  const html = renderToStaticMarkup(<StatBand stats={stats} />);
  expect(html).toContain('5+');
  expect(html).not.toContain('Empty metric');
});
