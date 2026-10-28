import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

const here = dirname(fileURLToPath(import.meta.url));
const cssPath = resolve(here, 'globals.css');
const colorsPath = resolve(here, '../../../../docs/design/redesign-colors.json');

const TEXT_SIZE_TOKENS = [
  '--text-display',
  '--text-title',
  '--text-heading',
  '--text-subheading',
  '--text-prose',
  '--text-body',
  '--text-meta',
  '--text-eyebrow',
  '--text-ui-title',
  '--text-ui',
  '--text-ui-meta',
] as const;

type Rgba = [number, number, number, number];
type ColorModes = { light: Rgba; dark: Rgba };
type ColorBook = Record<string, ColorModes>;

function extractBlock(css: string, selector: string): string {
  const escaped = selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const match = new RegExp(`^${escaped}\\s*\\{`, 'm').exec(css);
  if (!match || match.index === undefined) {
    throw new Error(`Missing selector ${selector}`);
  }
  const start = match.index;
  const open = css.indexOf('{', start);
  let depth = 0;
  for (let i = open; i < css.length; i += 1) {
    if (css[i] === '{') depth += 1;
    if (css[i] === '}') {
      depth -= 1;
      if (depth === 0) return css.slice(open + 1, i);
    }
  }
  throw new Error(`Unclosed block for ${selector}`);
}

function parseDeclarations(block: string): Map<string, string> {
  const withoutComments = block.replace(/\/\*[\s\S]*?\*\//g, '');
  const values = new Map<string, string>();
  for (const raw of withoutComments.split(';')) {
    const line = raw.trim();
    if (!line.startsWith('--')) continue;
    const colon = line.indexOf(':');
    if (colon === -1) continue;
    values.set(line.slice(0, colon).trim(), line.slice(colon + 1).trim());
  }
  return values;
}

function hexToRgba(hex: string): Rgba {
  const clean = hex.replace('#', '');
  const full =
    clean.length === 3
      ? clean
          .split('')
          .map((c) => c + c)
          .join('')
      : clean;
  const r = Number.parseInt(full.slice(0, 2), 16) / 255;
  const g = Number.parseInt(full.slice(2, 4), 16) / 255;
  const b = Number.parseInt(full.slice(4, 6), 16) / 255;
  const a = full.length === 8 ? Number.parseInt(full.slice(6, 8), 16) / 255 : 1;
  return [r, g, b, a];
}

function parseColor(value: string): Rgba | null {
  if (value.startsWith('#')) return hexToRgba(value);
  const rgb = value.match(/^rgba?\(\s*([\d.]+)\s+([\d.]+)\s+([\d.]+)(?:\s*\/\s*([\d.]+))?\s*\)$/i);
  if (!rgb) return null;
  const r = Number(rgb[1]) / 255;
  const g = Number(rgb[2]) / 255;
  const b = Number(rgb[3]) / 255;
  const a = rgb[4] === undefined ? 1 : Number(rgb[4]);
  return [r, g, b, a];
}

function nearlyEqual(a: Rgba, b: Rgba): boolean {
  return a.every((channel, i) => Math.abs(channel - (b[i] ?? 0)) < 1e-9);
}

describe('globals.css tokens', () => {
  const css = readFileSync(cssPath, 'utf8');
  const colors = JSON.parse(readFileSync(colorsPath, 'utf8')) as ColorBook;
  const light = parseDeclarations(extractBlock(css, ':root'));
  const dark = parseDeclarations(extractBlock(css, '.dark'));

  it('matches every colors.json token in light and dark', () => {
    const missing: string[] = [];
    const mismatches: string[] = [];

    for (const [name, modes] of Object.entries(colors)) {
      const token = `--${name}`;
      for (const [mode, expected] of [
        ['light', modes.light],
        ['dark', modes.dark],
      ] as const) {
        const raw = (mode === 'light' ? light : dark).get(token);
        if (!raw) {
          missing.push(`${mode} ${token}`);
          continue;
        }
        const parsed = parseColor(raw);
        if (!parsed) {
          mismatches.push(`${mode} ${token} unparsed ${raw}`);
          continue;
        }
        if (!nearlyEqual(parsed, expected)) {
          mismatches.push(`${mode} ${token}: css ${parsed} ≠ book ${expected}`);
        }
      }
    }

    expect(missing).toEqual([]);
    expect(mismatches).toEqual([]);
    expect(Object.keys(colors)).toHaveLength(58);
  });

  it('declares the 11 named text sizes', () => {
    for (const token of TEXT_SIZE_TOKENS) {
      expect(css.includes(`${token}:`)).toBe(true);
    }
  });
});

function luminance(color: Rgba): number {
  const channels = color
    .slice(0, 3)
    .map((value) => (value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4));
  return channels[0]! * 0.2126 + channels[1]! * 0.7152 + channels[2]! * 0.0722;
}

it('keeps public and CMS text palettes at AA contrast in both themes', () => {
  const css = readFileSync(cssPath, 'utf8');
  const admin = readFileSync(resolve(here, 'redesign.css'), 'utf8');
  for (const [source, selector] of [
    [css, ':root'],
    [css, '.dark'],
    [admin, '.admin'],
    [admin, '.dark .admin'],
  ]) {
    const tokens = parseDeclarations(extractBlock(source!, selector!));
    for (const [fg, bg] of [
      ['foreground', 'background'],
      ['muted-foreground', 'background'],
      ['subtle-foreground', 'background'],
      ['primary-foreground', 'primary'],
    ]) {
      const a = luminance(parseColor(tokens.get(`--${fg}`)!)!);
      const b = luminance(parseColor(tokens.get(`--${bg}`)!)!);
      expect(
        (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05),
        `${selector} ${fg}/${bg}`,
      ).toBeGreaterThanOrEqual(4.5);
    }
  }
});
