import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { resolve } from 'node:path';

import { expect, it } from 'vitest';

const root = resolve(import.meta.dirname, '../../../../..');
const require = createRequire(import.meta.url);
const coreThemePath = require.resolve('@parker2808/cms-core/theme.css');

function color(css: string, selector: string, token: string) {
  const start =
    css.indexOf(`${selector},`) >= 0 ? css.indexOf(`${selector},`) : css.indexOf(`${selector} {`);
  const block = start < 0 ? undefined : css.slice(css.indexOf('{', start) + 1).split('}')[0];
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
  const core = readFileSync(coreThemePath, 'utf8');
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

it('inherits the root dark theme on public hosts without overriding explicit host themes', () => {
  const host = readFileSync(resolve(root, 'apps/web/app/globals.css'), 'utf8');
  const core = readFileSync(coreThemePath, 'utf8');
  expect(core).toContain('.dark .cms-core:not([data-theme]),');
  expect(host).toContain('.dark .cms-core-host:not([data-theme]) {');
  expect(host).toContain(".dark .cms-core-host[data-brand='lilp']:not([data-theme]) {");
});

it('uses the hydrated dark card-glass surface in the no-script dark shell', () => {
  const host = readFileSync(resolve(root, 'apps/web/app/globals.css'), 'utf8');
  const shared = readFileSync(resolve(root, 'packages/ui/src/styles/globals.css'), 'utf8');
  const noScriptShell = host
    .split('@media (scripting: none) and (prefers-color-scheme: dark) {')[1]
    ?.split('  .cms-core.cms-core-host')[0];
  const hydratedDark = shared.split('.dark {')[1]?.split('}')[0];
  const cardGlass = hydratedDark?.match(/--card-glass:\s*([^;]+);/)?.[1];
  expect(cardGlass).toBeDefined();
  expect(noScriptShell).toContain(`--card-glass: ${cardGlass};`);
});
