import {
  type ComponentNode,
  type ComponentRegistry,
  readTree,
  resolveResponsive,
  type ResponsiveProps,
  type TreeDocument,
  type TreeErrorCode,
  type TreeNode,
} from '../../tree';

type Breakpoint = 'mobile' | 'tablet' | 'desktop';
type Properties = ResponsiveProps['base'];

export type TreeRenderOptions<Node> = {
  input: unknown;
  registry?: ComponentRegistry;
  labels: { unsupported: string };
  createElement: (
    tag: string,
    props: Record<string, unknown> | null,
    ...children: Array<Node | Node[] | string | number | null | undefined>
  ) => Node;
  components?: Readonly<Record<string, (node: ComponentNode, props: Properties) => Node>>;
  resolveMedia?: (src: string) => string | undefined;
};

export type TreeRenderResult<Node> =
  | { ok: true; content: Node; document: TreeDocument }
  | {
      ok: false;
      content: Node;
      code: TreeErrorCode | 'RENDER_FAILED';
      input: unknown;
      nodeId?: string;
    };

function safeUrl(value: string): boolean {
  return (
    (value.startsWith('/') && !value.startsWith('//') && !value.includes('\\')) ||
    /^https:\/\/[a-z0-9-]+(?:\.[a-z0-9-]+)*(?::[0-9]{1,5})?(?:[/?#][^\s\\]*)?$/i.test(value)
  );
}

class InvalidMediaError extends Error {}

function headingContent<Node>(node: ComponentNode, options: TreeRenderOptions<Node>): Node {
  const variants: Breakpoint[] = ['mobile', 'tablet', 'desktop'];
  const resolved = variants.map((breakpoint) => resolveResponsive(node.responsive, breakpoint));
  const level = resolved.some((props) => props.level === 1) ? 1 : node.responsive.base.level;
  const texts = resolved.map((props) => String(props.text));
  if (texts.every((text) => text === texts[0])) {
    return options.createElement(`h${level}`, null, texts[0]);
  }
  return options.createElement(
    `h${level}`,
    null,
    variants.map((breakpoint, index) =>
      options.createElement(
        'span',
        {
          className: `cms-tree__heading-text cms-tree__heading-text--${breakpoint}`,
          key: breakpoint,
        },
        texts[index],
      ),
    ),
  );
}

function responsiveContent<Node>(
  node: ComponentNode,
  options: TreeRenderOptions<Node>,
  render: (props: Properties) => Node,
): Node | Node[] {
  const variants: Breakpoint[] = ['mobile', 'tablet', 'desktop'];
  const resolved = variants.map((breakpoint) => resolveResponsive(node.responsive, breakpoint));
  if (resolved.every((props) => JSON.stringify(props) === JSON.stringify(resolved[0]))) {
    return render(resolved[0]!);
  }
  return variants.map((breakpoint, index) =>
    options.createElement(
      'div',
      { className: `cms-tree__variant cms-tree__variant--${breakpoint}`, key: breakpoint },
      render(resolved[index]!),
    ),
  );
}

function renderComponent<Node>(
  node: ComponentNode,
  options: TreeRenderOptions<Node>,
): Node | Node[] {
  if (node.componentType === 'heading') {
    return headingContent(node, options);
  }
  return responsiveContent(node, options, (props) => {
    const custom = options.components?.[node.componentType];
    if (custom) {
      return custom(node, props);
    }
    switch (node.componentType) {
      case 'paragraph':
        return options.createElement('p', null, String(props.text));
      case 'rich-text':
        return options.createElement('p', null, String(props.text));
      case 'image': {
        const src = options.resolveMedia
          ? options.resolveMedia(String(props.src))
          : String(props.src);
        if (!src || !safeUrl(src)) throw new InvalidMediaError('INVALID_MEDIA');
        return options.createElement('img', { src, alt: String(props.alt), loading: 'lazy' });
      }
      case 'button':
        return options.createElement(
          'a',
          { href: String(props.href), className: 'cms-core__button cms-core__button--primary' },
          String(props.label),
        );
      case 'divider':
        return options.createElement('hr', { 'aria-hidden': true });
      case 'spacer':
        return options.createElement('div', {
          className: `cms-tree__spacer cms-tree__spacer--${props.size}`,
          'aria-hidden': true,
        });
      default:
        throw new Error('UNKNOWN_COMPONENT');
    }
  });
}

function renderNode<Node>(node: TreeNode, options: TreeRenderOptions<Node>): Node {
  switch (node.type) {
    case 'page':
      return options.createElement(
        'div',
        { className: 'cms-tree', 'data-node-id': node.id },
        node.sections.map((child) => renderNode(child, options)),
      );
    case 'section':
      return options.createElement(
        'section',
        { className: 'cms-tree__section', 'data-node-id': node.id, key: node.id },
        node.content.map((child) => renderNode(child, options)),
      );
    case 'row': {
      const tracks = (breakpoint: Breakpoint) =>
        node.columns
          .map((column) => `${resolveResponsive(column.responsive, breakpoint).span}fr`)
          .join(' ');
      return options.createElement(
        'div',
        {
          className: 'cms-tree__row',
          'data-node-id': node.id,
          key: node.id,
          style: {
            '--cms-row-mobile': node.columns.some((column) => column.responsive.mobile)
              ? tracks('mobile')
              : 'minmax(0, 1fr)',
            '--cms-row-tablet': tracks('tablet'),
            '--cms-row-desktop': tracks('desktop'),
          },
        },
        node.columns.map((child) => renderNode(child, options)),
      );
    }
    case 'column': {
      return options.createElement(
        'div',
        { className: 'cms-tree__column', 'data-node-id': node.id, key: node.id },
        node.content.map((child) => renderNode(child, options)),
      );
    }
    case 'grid': {
      const props = node.responsive;
      const style = {
        '--cms-grid-mobile': resolveResponsive(props, 'mobile').columns,
        '--cms-grid-tablet': resolveResponsive(props, 'tablet').columns,
        '--cms-grid-desktop': resolveResponsive(props, 'desktop').columns,
      };
      return options.createElement(
        'div',
        { className: 'cms-tree__grid', 'data-node-id': node.id, key: node.id, style },
        node.items.map((child) => renderNode(child, options)),
      );
    }
    case 'component':
      return options.createElement(
        'div',
        { className: 'cms-tree__component', 'data-node-id': node.id, key: node.id },
        renderComponent(node, options),
      );
    case 'legacy-component':
      throw new Error('UNKNOWN_COMPONENT');
  }
}

export function renderTree<Node>(options: TreeRenderOptions<Node>): TreeRenderResult<Node> {
  const result = readTree(options.input, options.registry);
  const warning = options.createElement(
    'aside',
    { role: 'status', className: 'cms-tree__warning' },
    options.labels.unsupported,
  );
  if (!result.ok) return { ...result, content: warning };
  if (options.components?.heading) {
    return { ok: false, code: 'RENDER_FAILED', input: options.input, content: warning };
  }
  const pending: TreeNode[] = [result.value.root];
  while (pending.length) {
    const node = pending.pop()!;
    if (node.type === 'legacy-component') {
      return { ok: false, code: 'UNKNOWN_TYPE', input: options.input, content: warning };
    }
    if (node.type === 'page') pending.push(...node.sections);
    else if (node.type === 'section' || node.type === 'column') pending.push(...node.content);
    else if (node.type === 'row') pending.push(...node.columns);
    else if (node.type === 'grid') pending.push(...node.items);
  }
  try {
    return { ok: true, document: result.value, content: renderNode(result.value.root, options) };
  } catch (error) {
    return {
      ok: false,
      code: error instanceof InvalidMediaError ? 'INVALID_PROPS' : 'RENDER_FAILED',
      input: options.input,
      content: warning,
    };
  }
}
