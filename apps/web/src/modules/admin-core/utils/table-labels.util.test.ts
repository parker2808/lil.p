import { describe, expect, it } from 'vitest';

import en from '../../../../i18n/locales/en.json';
import vi from '../../../../i18n/locales/vi.json';
import { adminTableLabels } from './table-labels.util';

describe('adminTableLabels', () => {
  it.each([
    ['en', en, 'Archive or delete selected rows, or the active row if none are selected.'],
    ['vi', vi, 'Lưu trữ hoặc xóa các hàng đã chọn, hoặc hàng hiện tại nếu chưa chọn hàng nào.'],
  ])('uses accurate %s shortcut help', (_locale, messages, expected) => {
    const table = messages.admin.table;
    const labels = adminTableLabels(
      (key) => {
        const [group, field] = key.split('.') as [keyof typeof table, string | undefined];
        return field
          ? ((table[group] as Record<string, string>)[field] ?? '')
          : (table[group] as string);
      },
      {
        empty: '',
        emptyAction: '',
        noResults: '',
        clearFilters: '',
        error: '',
        selected: '',
        range: '',
        confirmDeleteTitle: '',
        confirmDelete: '',
        bulkDelete: '',
      },
    );

    expect(labels.shortcuts.remove).toBe(expected);
  });
});
