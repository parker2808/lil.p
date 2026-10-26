const PUBLIC_PATH =
  /^\/(en|vi)(\/|\/about|\/projects(\/[\w-]+)?|\/notes(\/[\w-]+)?|\/contact)?\/?$/;

export function safeDraftPath(value: string | null | undefined): string {
  if (!value || !value.startsWith('/') || value.startsWith('//') || value.includes('://')) {
    return '/en';
  }
  if (!PUBLIC_PATH.test(value)) {
    return '/en';
  }
  return value;
}
