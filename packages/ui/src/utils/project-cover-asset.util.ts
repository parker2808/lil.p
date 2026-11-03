const ILLUSTRATIVE_COVERS = new Set([
  'particula',
  'cfw-back-office-field-config',
  'cfw-sales-crm',
  'msp-advanced',
  'msp-app-expansion',
  'migration-data-tool',
  'lil-j-birthday-site',
  'ctrack-crystal',
  'my-3d-room',
]);

/** Repo assets are used only when the CMS has no verified media cover. */
export function projectCoverAsset(slug: string): {
  src: string;
  kind: 'illustration' | 'screenshot';
} | null {
  if (slug === 'interview-senior-fe') {
    return { src: '/mock/covers/interview-senior-fe.png', kind: 'screenshot' };
  }
  if (ILLUSTRATIVE_COVERS.has(slug)) {
    return { src: `/mock/covers/${slug}.svg`, kind: 'illustration' };
  }
  return null;
}
