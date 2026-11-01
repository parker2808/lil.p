import { act, render, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';

import { HeroStage } from './HeroStage';

const shader = vi.hoisted(() => ({ loaded: vi.fn(), start: vi.fn(() => vi.fn()) }));
vi.mock('./hero-shader', () => {
  shader.loaded();
  return { startHeroShader: shader.start };
});

let idleCallback: IdleRequestCallback | undefined;
let mediaMatches: Record<string, boolean>;

beforeEach(() => {
  shader.loaded.mockClear();
  shader.start.mockClear();
  idleCallback = undefined;
  mediaMatches = {};
  vi.stubGlobal('matchMedia', (query: string) => ({
    matches: Boolean(mediaMatches[query]),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  }));
  vi.stubGlobal('requestIdleCallback', (callback: IdleRequestCallback) => {
    idleCallback = callback;
    return 1;
  });
  vi.stubGlobal('cancelIdleCallback', vi.fn());
});

afterEach(() => vi.unstubAllGlobals());

it.each(['(max-width: 1023px)', '(pointer: coarse)', '(prefers-reduced-motion: reduce)'])(
  'does not load the shader when %s matches',
  async (query) => {
    mediaMatches[query] = true;
    const { container } = render(<HeroStage enabled />);
    await act(async () => {});
    expect(container.querySelector('.hero-stage')).toBeInTheDocument();
    expect(container.querySelector('canvas')).toBeNull();
    expect(idleCallback).toBeUndefined();
    expect(shader.loaded).not.toHaveBeenCalled();
  },
);

it('loads the desktop shader after idle', async () => {
  const { container } = render(<HeroStage enabled />);
  expect(container.querySelector('canvas')).toBeInTheDocument();
  expect(shader.loaded).not.toHaveBeenCalled();
  expect(idleCallback).toBeDefined();
  await act(async () => idleCallback?.({ didTimeout: false, timeRemaining: () => 50 }));
  await waitFor(() => expect(shader.start).toHaveBeenCalledWith(container.querySelector('canvas')));
});
