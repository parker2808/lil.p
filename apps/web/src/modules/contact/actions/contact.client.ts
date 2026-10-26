import { contactSchema, type ContactInput } from '@portfolio/contracts';

import { publicApiUrl } from '@/modules/core/utils/public-api-url.util';

import type { ContactActionResult } from './contact.result';

function flattenIssues(error: { issues: Array<{ path: PropertyKey[]; message: string }> }) {
  const fieldErrors: Record<string, string[]> = {};
  for (const issue of error.issues) {
    const path = issue.path.join('.') || 'root';
    fieldErrors[path] ??= [];
    fieldErrors[path].push(issue.message);
  }
  return fieldErrors;
}

export async function submitContactClient(input: unknown): Promise<ContactActionResult> {
  const parsed = contactSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, fieldErrors: flattenIssues(parsed.error) };
  }
  return postContact(parsed.data);
}

async function postContact(body: ContactInput): Promise<ContactActionResult> {
  let response: Response;
  try {
    response = await fetch(publicApiUrl('/api/public/contact'), {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(body),
    });
  } catch {
    return { ok: false, formError: 'failed' };
  }

  if (response.status === 201) {
    return { ok: true };
  }
  if (response.status === 429) {
    return { ok: false, formError: 'rateLimited' };
  }
  if (response.status === 400) {
    try {
      const json = (await response.json()) as { fieldErrors?: Record<string, string[]> };
      if (json.fieldErrors) {
        return { ok: false, fieldErrors: json.fieldErrors };
      }
    } catch {
      return { ok: false, formError: 'failed' };
    }
  }
  return { ok: false, formError: 'failed' };
}
