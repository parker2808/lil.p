import { isAllowedImageSrc, isAllowedMarkdownUrl } from '@portfolio/contracts';
import { Callout } from '@portfolio/ui/components/Callout/Callout';
import { CodeBlock } from '@portfolio/ui/components/CodeBlock/CodeBlock';
import type { Root } from 'hast';
import { toJsxRuntime } from 'hast-util-to-jsx-runtime';
import type { ReactNode } from 'react';
import { Fragment, jsx, jsxs } from 'react/jsx-runtime';

const HASH = '#';

export type MarkdownLabels = {
  copy: string;
  copied: string;
  wrap: string;
  note: string;
  warning: string;
  anchor: string;
};

function heading(
  Tag: 'h2' | 'h3',
  labels: MarkdownLabels,
  props: { id?: string; children?: ReactNode } & Record<string, unknown>,
) {
  const { id, children, ...rest } = props;
  return jsxs(Tag, {
    ...rest,
    id,
    children: [
      children,
      id
        ? jsx(
            'a',
            {
              href: `#${id}`,
              className: 'text-muted-foreground ml-2 no-underline',
              'aria-label': labels.anchor,
              children: HASH,
            },
            'anchor',
          )
        : null,
    ],
  });
}

export function hastToReact(tree: Root, labels: MarkdownLabels): ReactNode {
  return toJsxRuntime(tree, {
    Fragment,
    jsx,
    jsxs,
    components: {
      h2: (props) => heading('h2', labels, props),
      h3: (props) => heading('h3', labels, props),
      a: ({ href, children, ...props }) => {
        if (typeof href !== 'string' || !isAllowedMarkdownUrl(href)) {
          return jsx(Fragment, { children });
        }
        return jsx('a', { ...props, href, children });
      },
      img: ({ src, alt, ...props }) => {
        if (typeof src !== 'string' || !isAllowedImageSrc(src)) {
          return null;
        }
        return jsx('img', { ...props, src, alt: typeof alt === 'string' ? alt : '' });
      },
      table: (props) => {
        const rest = { ...props };
        delete (rest as { node?: unknown }).node;
        return jsx('div', {
          tabIndex: 0,
          className: 'max-w-full overflow-x-auto',
          children: jsx('table', rest),
        });
      },
      aside: (props) => {
        const { children, ...rest } = props;
        const kind = String(rest.dataCallout ?? rest['data-callout'] ?? '');
        if (kind === 'NOTE' || kind === 'WARNING') {
          return jsx(Callout, {
            kind,
            title: kind === 'NOTE' ? labels.note : labels.warning,
            children,
          });
        }
        return jsx('aside', { ...rest, children });
      },
      pre: (props) => {
        const { children, ...rest } = props;
        const language = String(rest.dataLanguage ?? rest['data-language'] ?? '') || 'text';
        const filenameRaw = rest.dataFilename ?? rest['data-filename'];
        const filename = typeof filenameRaw === 'string' && filenameRaw ? filenameRaw : undefined;
        const code = String(rest.dataCode ?? rest['data-code'] ?? '');
        return jsx(CodeBlock, {
          className: typeof rest.className === 'string' ? rest.className : undefined,
          code,
          language,
          filename,
          labels: { copy: labels.copy, copied: labels.copied, wrap: labels.wrap },
          children,
        });
      },
    },
  });
}
