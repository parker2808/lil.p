import { skillChipFixtures } from '@portfolio/contracts';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { TechMarquee } from './TechMarquee';

const labels = { pause: 'Pause marquee', play: 'Play marquee' };

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

describe('TechMarquee', () => {
  it('renders a static row when there are fewer than 6 items', () => {
    mockMatchMedia(false);
    const { container } = render(
      <TechMarquee items={skillChipFixtures.slice(0, 4)} labels={labels} />,
    );
    expect(container.querySelector('[data-static]')).not.toBeNull();
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('is static under reduced motion and hides the pause control', () => {
    mockMatchMedia(true);
    render(<TechMarquee items={skillChipFixtures} labels={labels} />);
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('toggles aria-pressed on the pause button', () => {
    mockMatchMedia(false);
    render(<TechMarquee items={skillChipFixtures} labels={labels} />);
    const button = screen.getByRole('button', { name: labels.pause });
    expect(button).toHaveAttribute('aria-pressed', 'false');
    fireEvent.click(button);
    expect(button).toHaveAttribute('aria-pressed', 'true');
    expect(button).toHaveAccessibleName(labels.play);
  });
});
