import type { ApiError } from '@/modules/core/utils/api-error.util';

export function mapFieldErrors(error: Pick<ApiError, 'fieldErrors'> | undefined) {
  const fieldErrors = error?.fieldErrors ?? {};
  return Object.fromEntries(
    Object.entries(fieldErrors).map(([key, messages]) => [key, messages[0] ?? '']),
  );
}
