'use server';

import { type ContactInput, contactSchema } from '@portfolio/contracts';
import { headers } from 'next/headers';

export type ContactActionResult =
  | { ok: true }
  | { ok: false; fieldErrors?: Record<string, string[]>; formError?: 'rateLimited' | 'failed' };

function flattenIssues(error: { issues: Array<{ path: PropertyKey[]; message: string }> }) {
  const fieldErrors: Record<string, string[]> = {};
  for (const issue of error.issues) {
    const path = issue.path.join('.') || 'root';
    fieldErrors[path] ??= [];
    fieldErrors[path].push(issue.message);
  }
  return fieldErrors;
}

function fromFormData(formData: FormData): Record<string, string> {
  return {
    name: String(formData.get('name') ?? ''),
    email: String(formData.get('email') ?? ''),
    topic: String(formData.get('topic') ?? ''),
    message: String(formData.get('message') ?? ''),
    website: String(formData.get('website') ?? ''),
    locale: String(formData.get('locale') ?? 'en'),
  };
}

export async function submitContact(input: unknown): Promise<ContactActionResult> {
  const parsed = contactSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, fieldErrors: flattenIssues(parsed.error) };
  }
  return postContact(parsed.data);
}

export async function submitContactForm(
  _prev: ContactActionResult | null,
  formData: FormData,
): Promise<ContactActionResult> {
  return submitContact(fromFormData(formData));
}

async function postContact(body: ContactInput): Promise<ContactActionResult> {
  const incoming = await headers();
  const forwarded = incoming.get('x-forwarded-for') ?? incoming.get('x-real-ip') ?? '';
  const origin = process.env.WEB_ORIGIN ?? 'http://localhost:3000';
  const apiUrl = process.env.API_URL ?? 'http://127.0.0.1:4000';
  const response = await fetch(new URL('/api/public/contact', apiUrl), {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      Origin: origin,
      'x-forwarded-for': forwarded,
    },
    body: JSON.stringify(body),
    cache: 'no-store',
  });

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
