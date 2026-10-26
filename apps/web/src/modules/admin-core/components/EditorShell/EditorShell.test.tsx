import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { EditorShell } from './EditorShell';

vi.mock('../../hooks/use-me.hook', () => ({
  useIsAdmin: () => false,
}));

const labels = {
  readOnly: 'Read only',
  properties: 'Properties',
  saving: 'Saving',
  saved: 'Saved',
  offline: 'Offline',
  conflict: 'Conflict',
  loadLatest: 'Load latest',
  overwrite: 'Overwrite',
  localeEn: 'EN',
  localeVi: 'VI',
};

describe('EditorShell', () => {
  it('shows a read-only badge and still renders the publish slot', () => {
    render(
      <EditorShell
        title="Case study"
        saveStatus="idle"
        publish={<button type="button">Publish</button>}
        properties={<p>Domain</p>}
        locale="en"
        onLocaleChange={() => undefined}
        completeness={{ en: true, vi: false }}
        labels={labels}
      >
        <p>Editor</p>
      </EditorShell>,
    );

    expect(screen.getByText(labels.readOnly)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Publish' })).toBeInTheDocument();
  });
});
