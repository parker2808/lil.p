import { describe, expect, it } from 'vitest';

import {
  localizeFieldIssue,
  localizeValidationIssue,
  localizeValidationMessage,
} from './localize-validation.util';

describe('admin validation localization', () => {
  it('preserves English details and empty server messages', () => {
    expect(localizeValidationMessage('Taken', 'en')).toBe('Taken');
    expect(localizeValidationMessage('', 'vi')).toBe('');
  });

  it('uses stable Zod issue codes for Vietnamese string and number bounds', () => {
    expect(
      localizeValidationIssue({ code: 'too_small', minimum: 2, message: 'Too small' }, 'vi'),
    ).toBe('Nhập tối thiểu 2 ký tự');
    expect(
      localizeValidationIssue(
        { code: 'too_big', origin: 'number', maximum: 10, message: 'Too big' },
        'vi',
      ),
    ).toBe('Giá trị không được quá 10');
    expect(localizeFieldIssue({ code: 'invalid_type', message: 'Invalid input' }, 'vi')).toBe(
      'Giá trị không hợp lệ',
    );
  });
});
