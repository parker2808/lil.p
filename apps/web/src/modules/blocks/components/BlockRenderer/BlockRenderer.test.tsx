import type { PublicBlock } from '@portfolio/contracts';
import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import en from '../../../../../i18n/locales/en.json';
import viStrings from '../../../../../i18n/locales/vi.json';

import { BlockRenderer } from './BlockRenderer';

const labels = { error: 'Failed', retry: 'Retry', empty: 'Empty' };
const context = { locale: 'en' as const };

function block(over: Partial<PublicBlock> = {}): PublicBlock {
  return {
    id: 1,
    type: 'hero',
    key: 'hero',
    layout: 'ONE',
    surface: 'PLAIN',
    props: {},
    lang: 'en',
    ...over,
  };
}

describe('BlockRenderer', () => {
  it('shows a dashed notice for unknown types in draft mode', () => {
    render(
      <BlockRenderer
        blocks={[block({ type: 'nope' as PublicBlock['type'] })]}
        draft
        context={context}
        labels={{ ...labels, unknown: 'Unknown block' }}
        registry={{}}
      />,
    );
    expect(screen.getByText('Unknown block')).toBeInTheDocument();
    expect(screen.queryByText('nope')).not.toBeInTheDocument();
  });

  it.each([
    ['en', en.states],
    ['vi', viStrings.states],
  ] as const)('shows sanitized %s preview help without raw diagnostics', (locale, states) => {
    const rawIssue = 'Invalid path: internal.diagnostic=private';
    const { container } = render(
      <BlockRenderer
        blocks={[]}
        invalidBlocks={[{ id: 4, key: 'invalid', type: 'internal-type', issues: [rawIssue] }]}
        draft
        context={{ locale }}
        labels={{
          ...labels,
          unknown: states.unknownBlock,
          unknownHelp: states.unknownBlockHelp,
        }}
        registry={{}}
      />,
    );
    expect(screen.getByText(states.unknownBlock)).toBeInTheDocument();
    expect(screen.getByText(states.unknownBlockHelp)).toBeInTheDocument();
    expect(container.querySelector('[role="status"]')).toHaveTextContent(states.unknownBlockHelp);
    expect(container.textContent).not.toContain(states.empty);
    expect(container.textContent).not.toContain(rawIssue);
    expect(container.textContent).not.toContain('internal-type');
  });

  it('renders nothing for an unknown type', () => {
    const { container } = render(
      <BlockRenderer
        blocks={[block({ type: 'nope' as PublicBlock['type'] })]}
        context={context}
        labels={labels}
        registry={{}}
      />,
    );
    expect(container).toBeEmptyDOMElement();
  });

  it('keeps a throwing renderer inside its own error state', () => {
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
    function Boom(): null {
      throw new Error('boom');
    }
    render(
      <BlockRenderer
        blocks={[block(), block({ id: 2, key: 'cta', type: 'cta-band' })]}
        context={context}
        labels={labels}
        registry={{
          hero: { component: Boom, skeleton: () => null },
          'cta-band': {
            component: () => <p>cta-ok</p>,
            skeleton: () => null,
          },
        }}
      />,
    );
    expect(screen.getByText('Failed')).toBeInTheDocument();
    expect(screen.getByText('cta-ok')).toBeInTheDocument();
  });
});

it('drops resolved empty entries before band grouping and layout padding', () => {
  const { container } = render(
    <BlockRenderer
      blocks={[block({ surface: 'BAND' }), block({ id: 2, key: 'empty' })]}
      context={context}
      labels={labels}
      registry={{ hero: { component: () => null, skeleton: () => null } }}
      resolved={{ 1: null, 2: null }}
    />,
  );
  expect(container).toBeEmptyDOMElement();
});
