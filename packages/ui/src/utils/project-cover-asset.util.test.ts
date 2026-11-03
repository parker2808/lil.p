import { describe, expect, it } from 'vitest';

import { projectCoverAsset } from './project-cover-asset.util';

describe('project cover provenance', () => {
  it('maps every verified project to an explicit screenshot or illustration', () => {
    const slugs = [
      'particula',
      'cfw-back-office-field-config',
      'cfw-sales-crm',
      'msp-advanced',
      'msp-app-expansion',
      'migration-data-tool',
      'lil-j-birthday-site',
      'ctrack-crystal',
      'interview-senior-fe',
      'my-3d-room',
    ];
    expect(slugs.map(projectCoverAsset).filter(Boolean)).toHaveLength(10);
    expect(
      slugs.map((slug) => projectCoverAsset(slug)?.kind).filter((kind) => kind === 'screenshot'),
    ).toHaveLength(1);
    expect(projectCoverAsset('unknown')).toBeNull();
  });
});
