import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { expect, it } from 'vitest';

const root = resolve(import.meta.dirname, '../../../../..');

function color(css: string, selector: string, token: string) {
  const block = css.split(`${selector} {`)[1]?.split('}')[0];
  const value = block?.match(new RegExp(`--${token}: (#[0-9a-f]{6});`))?.[1];
  expect(value, `${selector} --${token}`).toBeDefined();
  return value!;
}

function luminance(hex: string) {
  const channels = hex.match(/[0-9a-f]{2}/g)!.map((part) => {
    const value = Number.parseInt(part, 16) / 255;
    return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
  });
  return channels[0]! * 0.2126 + channels[1]! * 0.7152 + channels[2]! * 0.0722;
}

it('keeps dark host subtle text AA on neutral and branded card surfaces', () => {
  const host = readFileSync(resolve(root, 'apps/web/app/globals.css'), 'utf8');
  const core = readFileSync(resolve(root, 'packages/cms-core/src/theme/theme.css'), 'utf8');
  const foreground = luminance(
    color(host, ".cms-core-host[data-theme='dark']", 'subtle-foreground'),
  );
  const surfaces = [
    color(core, ".cms-core[data-theme='dark']", 'builder-surface'),
    color(host, ".cms-core-host[data-brand='lilp'][data-theme='dark']", 'builder-art'),
  ];
  for (const surface of surfaces) {
    const background = luminance(surface);
    expect(
      (Math.max(foreground, background) + 0.05) / (Math.min(foreground, background) + 0.05),
    ).toBeGreaterThanOrEqual(4.5);
  }
});
