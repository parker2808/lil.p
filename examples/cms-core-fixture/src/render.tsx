import type { InvalidPreviewBlock, Locale, PublicBlock } from '@parker2808/cms-core/contracts';
import { renderBlocks } from '@parker2808/cms-core/react/server';
import { Fragment, type ReactNode } from 'react';

import { type BlockType, copy, registry } from './content';

const media = { '/illustration.svg': '/illustration.svg' } as const;

export function PageBlocks({
  blocks,
  locale,
  draft = false,
  invalidBlocks = [],
}: {
  blocks: PublicBlock[];
  locale: Locale;
  draft?: boolean;
  invalidBlocks?: InvalidPreviewBlock[];
}) {
  const words = copy[locale];
  const groups = renderBlocks<PublicBlock, Locale, ReactNode, (typeof registry)[BlockType]>({
    blocks,
    invalidBlocks,
    draft,
    context: locale,
    labels: {
      error: words.error,
      retry: words.retry,
      empty: words.empty,
      unknown: words.unknownBlock,
    },
    registry,
    renderComponent: (_entry, item, language) => {
      const props = item.props as Record<string, unknown>;
      const localized = (field: string) => (props[field] as Record<Locale, string>)[language];
      switch (item.type) {
        case 'heading':
          return <h1 className="fixture-heading">{localized('title')}</h1>;
        case 'paragraph':
          return <p className="fixture-paragraph">{localized('body')}</p>;
        case 'action':
          return (
            <a className="fixture-action" href={String(props.href)}>
              {localized('label')} <span aria-hidden="true">↗</span>
            </a>
          );
        case 'image':
          return (
            <img
              className="fixture-image"
              src={media[String(props.src) as keyof typeof media] ?? '/illustration.svg'}
              alt={localized('alt')}
            />
          );
        default:
          return null;
      }
    },
    renderSkeleton: () => <span role="status">{words.empty}</span>,
    wrapBlock: (item, node) => (
      <div key={item.key} data-block={item.type} className="fixture-block">
        {node}
      </div>
    ),
    wrapBand: (items, nodes) => (
      <section className="fixture-band" data-count={items.length}>
        {nodes.map((node, index) => (
          <Fragment key={items[index].key}>{node}</Fragment>
        ))}
      </section>
    ),
    wrapBoundary: (_item, node) => node,
    renderUnknown: (item, label) => (
      <aside key={item.key} className="fixture-warning" role="status" data-unknown={item.type}>
        <strong>{label}</strong>
        <p>{words.unsupported}</p>
      </aside>
    ),
  });

  return (
    <div className="fixture-page-content">
      {groups.map((group, index) => (
        <Fragment key={index}>{group}</Fragment>
      ))}
    </div>
  );
}
