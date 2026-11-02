const PUBLIC_PATH =
  /^\/(en|vi)(\/|\/projects(\/[\w-]+)?|\/notes(\/[\w-]+)?|\/[a-z0-9]+(?:-[a-z0-9]+)*)?\/?$/;

export function safeDraftPath(value: string | null | undefined): string {
  if (!value || !value.startsWith('/') || value.startsWith('//') || value.includes('://')) {
    return '/en';
  }
  if (!PUBLIC_PATH.test(value)) {
    return '/en';
  }
  return value;
}
