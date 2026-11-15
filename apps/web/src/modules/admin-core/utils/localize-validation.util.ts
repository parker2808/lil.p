export type AdminLocale = 'en' | 'vi';

export function localizeValidationMessage(message: string, locale: AdminLocale): string {
  if (!message) return '';
  if (locale === 'en') return message;
  if (message === 'Required') return 'Bắt buộc';
  const minimum = message.match(/(?:at least|minimum of|contain at least) (\d+)/i);
  if (minimum) return `Nhập tối thiểu ${minimum[1]} ký tự`;
  const maximum = message.match(/(?:at most|maximum of|contain at most) (\d+)/i);
  if (maximum) return `Nhập tối đa ${maximum[1]} ký tự`;
  return 'Giá trị không hợp lệ';
}

export function localizeValidationIssue(
  issue: {
    code?: string;
    origin?: string;
    minimum?: number | bigint;
    maximum?: number | bigint;
    message: string;
  },
  locale: AdminLocale,
): string {
  if (locale === 'en') return issue.message;
  if (issue.code === 'too_small' && issue.minimum !== undefined) {
    return issue.origin === 'number'
      ? `Giá trị phải từ ${issue.minimum} trở lên`
      : `Nhập tối thiểu ${issue.minimum} ký tự`;
  }
  if (issue.code === 'too_big' && issue.maximum !== undefined) {
    return issue.origin === 'number'
      ? `Giá trị không được quá ${issue.maximum}`
      : `Nhập tối đa ${issue.maximum} ký tự`;
  }
  return localizeValidationMessage(issue.message, locale);
}

export function localizeFieldIssue(issue: unknown, locale: AdminLocale): string | undefined {
  if (typeof issue === 'string') return localizeValidationMessage(issue, locale);
  if (issue && typeof issue === 'object' && 'message' in issue) {
    return localizeValidationIssue(issue as { message: string; code?: string }, locale);
  }
  return undefined;
}
