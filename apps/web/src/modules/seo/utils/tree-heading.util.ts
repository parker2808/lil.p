import { HOST_TREE_REGISTRY, resolveBlockLocale, type Locale } from '@portfolio/contracts';
import { readTree, resolveResponsive, type TreeNode } from '@parker2808/cms-core/tree';

export function firstTreeHeading(
  input: unknown,
  locale: Locale,
): { title?: string; intro?: string } {
  const parsed = readTree(input, HOST_TREE_REGISTRY);
  if (!parsed.ok) return {};

  const visit = (node: TreeNode): { title?: string; intro?: string } | undefined => {
    if (node.type === 'component') {
      if (node.componentType === 'heading') {
        const props = resolveResponsive(node.responsive, 'mobile');
        if (props.level === 1 && typeof props.text === 'string') return { title: props.text };
      } else if (node.componentType === 'page-header') {
        const props = resolveResponsive(node.responsive, 'mobile');
        const localized = resolveBlockLocale(props, locale).props;
        if (typeof localized.title === 'string') {
          return {
            title: localized.title,
            intro: typeof localized.intro === 'string' ? localized.intro : undefined,
          };
        }
      }
    }

    const children =
      node.type === 'page'
        ? node.sections
        : node.type === 'section' || node.type === 'column'
          ? node.content
          : node.type === 'row'
            ? node.columns
            : node.type === 'grid'
              ? node.items
              : [];
    for (const child of children) {
      const heading = visit(child);
      if (heading?.title?.trim()) return heading;
    }
    return undefined;
  };

  return visit(parsed.value.root) ?? {};
}
