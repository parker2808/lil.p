import type { ErrorCode } from '@portfolio/contracts';

export class ApiError extends Error {
  readonly status: number;
  readonly code: ErrorCode | string;
  readonly requestId?: string;
  readonly fieldErrors?: Record<string, string[]>;

  constructor(input: {
    status: number;
    code?: string;
    message: string;
    requestId?: string;
    fieldErrors?: Record<string, string[]>;
  }) {
    super(input.message);
    this.name = 'ApiError';
    this.status = input.status;
    this.code = input.code ?? 'INTERNAL';
    this.requestId = input.requestId;
    this.fieldErrors = input.fieldErrors;
  }
}

export async function apiErrorFromResponse(response: Response): Promise<ApiError> {
  let body: {
    code?: string;
    message?: string;
    requestId?: string;
    fieldErrors?: Record<string, string[]>;
  } = {};
  try {
    body = (await response.json()) as typeof body;
  } catch {
    body = {};
  }
  return new ApiError({
    status: response.status,
    code: body.code,
    message: body.message ?? response.statusText,
    requestId: body.requestId,
    fieldErrors: body.fieldErrors,
  });
}
