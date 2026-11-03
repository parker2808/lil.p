import { afterEach, describe, expect, it, vi } from 'vitest';

import { copyEmail } from './copy-email.util';

const address = ['owner', 'example.invalid'].join('@');

function secureContext(value: boolean) {
  Object.defineProperty(window, 'isSecureContext', { configurable: true, value });
}

function clipboard(writeText: (value: string) => Promise<void>) {
  Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText } });
}

describe('copyEmail', () => {
  afterEach(() => {
    vi.restoreAllMocks();
    document.body.replaceChildren();
  });

  it('uses the Clipboard API in a secure context', async () => {
    secureContext(true);
    const writeText = vi.fn().mockResolvedValue(undefined);
    clipboard(writeText);
    const fallback = vi.fn();
    Object.defineProperty(document, 'execCommand', { configurable: true, value: fallback });

    expect(await copyEmail(` ${address} `)).toBe(true);
    expect(writeText).toHaveBeenCalledWith(address);
    expect(fallback).not.toHaveBeenCalled();
  });

  it.each(['rejected', 'unavailable'] as const)(
    'falls back when the Clipboard API is %s and restores focus',
    async (state) => {
      secureContext(true);
      const writeText = vi.fn().mockRejectedValue(new Error('blocked'));
      clipboard(state === 'unavailable' ? undefined! : writeText);
      Object.defineProperty(document, 'execCommand', {
        configurable: true,
        value: vi.fn().mockReturnValue(true),
      });
      const button = document.createElement('button');
      document.body.append(button);
      button.focus();

      expect(await copyEmail(address)).toBe(true);
      expect(document.execCommand).toHaveBeenCalledWith('copy');
      expect(document.activeElement).toBe(button);
      expect(document.querySelector('textarea')).toBeNull();
    },
  );

  it('reports failure when both copy paths fail', async () => {
    secureContext(true);
    clipboard(vi.fn().mockRejectedValue(new Error('blocked')));
    Object.defineProperty(document, 'execCommand', {
      configurable: true,
      value: vi.fn().mockReturnValue(false),
    });
    expect(await copyEmail(address)).toBe(false);
    expect(document.querySelector('textarea')).toBeNull();
  });

  it('never copies a missing or empty address', async () => {
    secureContext(true);
    const writeText = vi.fn();
    clipboard(writeText);
    expect(await copyEmail(undefined)).toBe(false);
    expect(await copyEmail('  ')).toBe(false);
    expect(writeText).not.toHaveBeenCalled();
  });
});
