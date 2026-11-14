import { type PageSnapshot, type PageSnapshotBlock, pageSnapshotSchema } from '../contracts';
import { type BlockRegistry, findBlock } from './policy';

export type SnapshotResult =
  | { ok: true; snapshot: PageSnapshot }
  | {
      ok: false;
      reason: 'INVALID_SNAPSHOT' | 'UNKNOWN_TYPE' | 'FUTURE_VERSION' | 'INVALID_BLOCK';
      index?: number;
    };

function copyValue<Value>(value: Value): Value {
  if (Array.isArray(value)) return value.map(copyValue) as Value;
  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value).map(([key, item]) => [key, copyValue(item)]),
    ) as Value;
  }
  return value;
}

function hasUnknownFields(value: unknown, allowed: readonly string[]): boolean {
  return (
    value !== null &&
    typeof value === 'object' &&
    Object.keys(value).some((key) => !allowed.includes(key))
  );
}

export function readSnapshot(value: unknown, registry: BlockRegistry): SnapshotResult {
  if (value && typeof value === 'object' && 'schemaVersion' in value) {
    return { ok: false, reason: 'FUTURE_VERSION' };
  }
  if (hasUnknownFields(value, ['seo', 'blocks'])) {
    return { ok: false, reason: 'INVALID_SNAPSHOT' };
  }
  if (value && typeof value === 'object' && 'seo' in value) {
    if (
      hasUnknownFields(value.seo, [
        'seoTitleEn',
        'seoTitleVi',
        'seoDescriptionEn',
        'seoDescriptionVi',
      ])
    ) {
      return { ok: false, reason: 'INVALID_SNAPSHOT' };
    }
    if ('blocks' in value && Array.isArray(value.blocks)) {
      for (const [index, block] of value.blocks.entries()) {
        if (
          hasUnknownFields(block, [
            'type',
            'key',
            'schemaVersion',
            'props',
            'layout',
            'surface',
            'isVisible',
            'sortOrder',
          ])
        ) {
          return { ok: false, reason: 'INVALID_BLOCK', index };
        }
      }
    }
  }
  const parsed = pageSnapshotSchema.safeParse(value);
  if (!parsed.success) return { ok: false, reason: 'INVALID_SNAPSHOT' };
  for (const [index, block] of parsed.data.blocks.entries()) {
    const definition = findBlock(registry, block.type);
    if (!definition) return { ok: false, reason: 'UNKNOWN_TYPE', index };
    if (block.schemaVersion > definition.version || block.schemaVersion < 0) {
      return { ok: false, reason: 'FUTURE_VERSION', index };
    }
  }
  return { ok: true, snapshot: copyValue(parsed.data) };
}

export function migrateSnapshot(value: unknown, registry: BlockRegistry): SnapshotResult {
  const read = readSnapshot(value, registry);
  if (!read.ok) return read;
  const blocks: PageSnapshotBlock[] = [];
  for (const [index, block] of read.snapshot.blocks.entries()) {
    const definition = findBlock(registry, block.type)!;
    let props: unknown = copyValue(block.props);
    try {
      for (let version = block.schemaVersion; version < definition.version; version += 1) {
        props = definition.migrate(props, version);
      }
    } catch {
      return { ok: false, reason: 'INVALID_BLOCK', index };
    }
    const validated = definition.props.safeParse(props);
    if (!validated.success) return { ok: false, reason: 'INVALID_BLOCK', index };
    blocks.push({ ...block, schemaVersion: definition.version, props });
  }
  return { ok: true, snapshot: { seo: read.snapshot.seo, blocks } };
}

export function buildSnapshot(
  seo: PageSnapshot['seo'],
  blocks: readonly PageSnapshotBlock[],
): PageSnapshot {
  return copyValue({ seo, blocks: [...blocks] });
}
