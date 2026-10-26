import type { Locale } from '../common/locale.schema';
import type { PublicBlock } from './block.type';
import { BLOCK_REGISTRY, type BlockType } from './block-registry.constant';

export type ParseBlockRow = {
  id: number;
  type: string;
  key: string;
  layout: PublicBlock['layout'];
  surface: PublicBlock['surface'];
  schemaVersion: number;
  props: unknown;
};

export type ParseBlockOk = { ok: true; block: ParseBlockRow & { type: BlockType; props: unknown } };
export type ParseBlockFail = {
  ok: false;
  reason: 'UNKNOWN_TYPE' | 'INVALID_PROPS';
  issues: string[];
};
export type ParseBlockResult = ParseBlockOk | ParseBlockFail;

function hasText(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

export function isLocalizedPair(value: unknown): value is { en: string; vi?: string } {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return false;
  }
  const keys = Object.keys(value);
  return keys.includes('en') && keys.every((key) => key === 'en' || key === 'vi');
}

function walkLocalized(value: unknown, visit: (pair: { en: string; vi?: string }) => void): void {
  if (isLocalizedPair(value)) {
    visit(value);
    return;
  }
  if (Array.isArray(value)) {
    for (const item of value) walkLocalized(item, visit);
    return;
  }
  if (value && typeof value === 'object') {
    for (const item of Object.values(value)) walkLocalized(item, visit);
  }
}

function mapLocalized(
  value: unknown,
  pick: (pair: { en: string; vi?: string }) => string,
): unknown {
  if (isLocalizedPair(value)) {
    return pick(value);
  }
  if (Array.isArray(value)) {
    return value.map((item) => mapLocalized(item, pick));
  }
  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value).map(([key, item]) => [key, mapLocalized(item, pick)]),
    );
  }
  return value;
}

export function parseBlock(row: ParseBlockRow): ParseBlockResult {
  const definition = BLOCK_REGISTRY[row.type as BlockType];
  if (!definition) {
    return { ok: false, reason: 'UNKNOWN_TYPE', issues: [`Unknown block type: ${row.type}`] };
  }

  const migrated = definition.migrate(row.props, row.schemaVersion);
  const parsed = definition.props.safeParse(migrated);
  if (!parsed.success) {
    return {
      ok: false,
      reason: 'INVALID_PROPS',
      issues: parsed.error.issues.map((issue) => `${issue.path.join('.')}: ${issue.message}`),
    };
  }

  return {
    ok: true,
    block: {
      ...row,
      type: definition.type as BlockType,
      props: parsed.data,
    },
  };
}

/**
 * Replace every `{ en, vi }` pair with one string. D19 applies to the
 * whole block: missing Vietnamese on any English field → `lang: "en"`.
 */
export function resolveBlockLocale(
  props: unknown,
  locale: Locale,
): { props: Record<string, unknown>; lang: Locale } {
  const pairs: { en: string; vi?: string }[] = [];
  walkLocalized(props, (pair) => pairs.push(pair));

  const englishReady = pairs.filter((pair) => hasText(pair.en));
  const useVi =
    locale === 'vi' && englishReady.length > 0 && englishReady.every((pair) => hasText(pair.vi));
  const lang: Locale = useVi ? 'vi' : 'en';

  const resolved = mapLocalized(props, (pair) =>
    lang === 'vi' && hasText(pair.vi) ? pair.vi : (pair.en ?? ''),
  );

  return {
    props: (resolved && typeof resolved === 'object' && !Array.isArray(resolved)
      ? resolved
      : {}) as Record<string, unknown>,
    lang,
  };
}
