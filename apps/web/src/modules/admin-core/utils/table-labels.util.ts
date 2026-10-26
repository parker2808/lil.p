import type { DataTableLabels } from '@portfolio/ui/components/DataTable/DataTable';

export function adminTableLabels(
  table: (key: string) => string,
  copy: Pick<
    DataTableLabels,
    | 'empty'
    | 'emptyAction'
    | 'noResults'
    | 'clearFilters'
    | 'error'
    | 'selected'
    | 'range'
    | 'confirmDeleteTitle'
    | 'confirmDelete'
    | 'bulkDelete'
  >,
): DataTableLabels {
  return {
    ...copy,
    retry: table('retry'),
    previous: table('previous'),
    next: table('next'),
    columns: table('columns'),
    density: table('density'),
    densityDefault: table('densityDefault'),
    densityCompact: table('densityCompact'),
    help: table('help'),
    helpTitle: table('helpTitle'),
    cancel: table('cancel'),
    shortcuts: {
      move: table('shortcuts.move'),
      select: table('shortcuts.select'),
      open: table('shortcuts.open'),
      edit: table('shortcuts.edit'),
      remove: table('shortcuts.remove'),
      help: table('shortcuts.help'),
      keys: {
        j: table('keys.j'),
        k: table('keys.k'),
        x: table('keys.x'),
        enter: table('keys.enter'),
        e: table('keys.e'),
        backspace: table('keys.backspace'),
        help: table('keys.help'),
      },
    },
  };
}
