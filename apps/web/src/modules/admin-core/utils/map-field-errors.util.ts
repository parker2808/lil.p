import type { ApiError } from '@/modules/core/utils/api-error.util';
import { localizeValidationMessage, type AdminLocale } from './localize-validation.util';

export function mapFieldErrors(
  error: Pick<ApiError, 'fieldErrors'> | undefined,
  locale: AdminLocale = 'en',
) {
  const fieldErrors = error?.fieldErrors ?? {};
  return Object.fromEntries(
    Object.entries(fieldErrors).map(([key, messages]) => [
      key,
      localizeValidationMessage(messages[0] ?? '', locale),
    ]),
  );
}
