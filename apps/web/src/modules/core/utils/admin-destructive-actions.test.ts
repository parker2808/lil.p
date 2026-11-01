import { readdirSync, readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '../../../../../..');
const modules = resolve(root, 'apps/web/src/modules');
const destructiveCall = /\b\w*(remove|delete|archive)\w*\.mutate(Async)?\(/i;
const guardedProps = new Set(['onDelete', 'onBulkDelete']);

function source(path: string) {
  return readFileSync(resolve(root, path), 'utf8');
}

function adminFiles() {
  return readdirSync(modules, { recursive: true, encoding: 'utf8' })
    .filter((path) => path.startsWith('admin-') && path.endsWith('.tsx'))
    .filter((path) => !path.endsWith('.test.tsx'))
    .map((path) => join(modules, path));
}

function enclosingProp(lines: string[], index: number) {
  for (let i = index; i >= 0; i -= 1) {
    const prop = /^\s*(on\w+)=/.exec(lines[i] ?? '');
    if (prop) return prop[1];
  }
  return undefined;
}

describe('admin delete and archive controls', () => {
  it('routes every destructive mutation through ConfirmDialog or toastUndo', () => {
    const unguarded: string[] = [];
    let calls = 0;

    for (const file of adminFiles()) {
      const text = readFileSync(file, 'utf8');
      const guardedInFile = text.includes('<ConfirmDialog') || text.includes('toastUndo(');
      const lines = text.split('\n');
      lines.forEach((line, index) => {
        if (!destructiveCall.test(line)) return;
        calls += 1;
        const prop = enclosingProp(lines, index);
        if (guardedInFile || (prop && guardedProps.has(prop))) return;
        unguarded.push(`${file.slice(root.length + 1)}:${index + 1}`);
      });
    }

    expect(calls).toBeGreaterThan(0);
    expect(unguarded).toEqual([]);
  });

  it('confirms onDelete and onBulkDelete before calling them in the shared tables', () => {
    const table = source('packages/ui/src/components/DataTable/DataTable.tsx');
    const dialogAt = table.indexOf('<ConfirmDialog');
    expect(dialogAt).toBeGreaterThan(-1);
    for (const call of ['onDelete?.(', 'onBulkDelete?.(']) {
      expect(table.split(call)).toHaveLength(2);
      expect(table.indexOf(call)).toBeGreaterThan(dialogAt);
    }
    expect(table).toContain('onClick={() => requestDelete(selectedRows)}');

    const smallEntity = source(
      'apps/web/src/modules/admin-core/components/SmallEntityIndex/SmallEntityIndex.tsx',
    );
    expect(smallEntity).toContain('<ConfirmDialog');
    expect(smallEntity).toContain('onClick={() => setPendingDelete(row.original)}');

    expect(source('apps/web/src/modules/admin-pages/views/AdminPagesEditor.tsx')).toContain(
      'onDelete={setDeleteId}',
    );
    expect(source('apps/web/src/modules/admin-media/views/AdminMediaIndex.tsx')).toMatch(
      /onClick=\{\(\) => \{\s*setPendingDeleteId\(editing\.id\)/,
    );
  });
});
