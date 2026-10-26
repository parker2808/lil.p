export function safeAdminNext(value: string | null | undefined): string {
  if (!value || !value.startsWith('/admin')) {
    return '/admin';
  }
  if (value.startsWith('//') || value.includes('://')) {
    return '/admin';
  }
  return value;
}
