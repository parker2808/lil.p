import { skillChipFixtures } from '@portfolio/contracts';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { TechMarquee } from './TechMarquee';

const labels = { pause: 'Pause marquee', play: 'Play marquee' };

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

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
    fireEvent.click(button);
    expect(button).toHaveAttribute('aria-pressed', 'false');
  });

  it('pauses on hover and resumes when the pointer leaves', () => {
    mockMatchMedia(false);
    const { container } = render(<TechMarquee items={skillChipFixtures} labels={labels} />);
    const marquee = container.querySelector('[data-slot="tech-marquee"]')!;
    const track = container.querySelector('.marquee-track')!;

    expect(track).not.toHaveClass('marquee-paused');
    fireEvent.mouseEnter(marquee);
    expect(track).toHaveClass('marquee-paused');
    expect(track).toHaveAttribute('data-paused', 'true');
    fireEvent.mouseLeave(marquee);
    expect(track).not.toHaveClass('marquee-paused');
  });

  it('pauses while focus is within the marquee', () => {
    mockMatchMedia(false);
    const { container } = render(<TechMarquee items={skillChipFixtures} labels={labels} />);
    const track = container.querySelector('.marquee-track')!;
    const button = screen.getByRole('button', { name: labels.pause });

    fireEvent.focus(button);
    expect(track).toHaveClass('marquee-paused');
    fireEvent.blur(button, { relatedTarget: document.body });
    expect(track).not.toHaveClass('marquee-paused');
  });

  it('pauses while the tab is hidden and resumes when it is visible', () => {
    mockMatchMedia(false);
    let hidden = false;
    vi.spyOn(document, 'hidden', 'get').mockImplementation(() => hidden);
    const { container } = render(<TechMarquee items={skillChipFixtures} labels={labels} />);
    const track = container.querySelector('.marquee-track')!;

    hidden = true;
    fireEvent(document, new Event('visibilitychange'));
    expect(track).toHaveClass('marquee-paused');
    hidden = false;
    fireEvent(document, new Event('visibilitychange'));
    expect(track).not.toHaveClass('marquee-paused');
  });
});
