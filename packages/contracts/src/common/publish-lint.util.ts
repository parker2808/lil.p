const FORBIDDEN = [
  { needle: '{{', message: 'Must not contain template placeholders' },
  { needle: 'TODO', message: 'Must not contain TODO' },
  { needle: 'lorem', message: 'Must not contain placeholder copy' },
] as const;

export function publishLint(fields: Record<string, string | null | undefined>): {
  ok: boolean;
  fieldErrors: Record<string, string[]>;
} {
  const fieldErrors: Record<string, string[]> = {};
  for (const [path, raw] of Object.entries(fields)) {
    if (typeof raw !== 'string' || raw.trim().length === 0) {
      continue;
    }
    const lower = raw.toLowerCase();
    for (const rule of FORBIDDEN) {
      const hit =
        rule.needle === 'TODO' ? raw.includes('TODO') : lower.includes(rule.needle.toLowerCase());
      if (hit) {
        fieldErrors[path] ??= [];
        fieldErrors[path].push(rule.message);
      }
    }
  }
  return { ok: Object.keys(fieldErrors).length === 0, fieldErrors };
}
