import { cleanup, render, screen, within } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

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
  afterEach(cleanup);

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

  it('keeps the back link in the header and stacks preview under properties', () => {
    render(
      <EditorShell
        title="Home"
        back={{ href: '/admin/pages', label: 'Pages' }}
        saveStatus="saved"
        savedText="Saved 10:42"
        properties={<p>Domain</p>}
        preview={<p>Preview frame</p>}
        locale="en"
        onLocaleChange={() => undefined}
        completeness={{ en: true, vi: true }}
        labels={labels}
      >
        <p>Editor</p>
      </EditorShell>,
    );

    const header = screen.getByRole('banner');
    expect(header).toHaveClass('admin-editor-header');
    expect(within(header).getByRole('link', { name: 'Pages' })).not.toHaveClass('sm:hidden');
    const aside = screen.getByRole('complementary', { name: labels.properties });
    expect(within(aside).getByText('Domain')).toBeInTheDocument();
    expect(within(aside).getByText('Preview frame')).toBeInTheDocument();
    expect(screen.getAllByRole('complementary')).toHaveLength(1);
  });
});
