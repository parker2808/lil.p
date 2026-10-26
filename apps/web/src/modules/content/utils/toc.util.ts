import type { TocItem } from '@portfolio/ui/components/SectionNav/SectionNav';
import GithubSlugger from 'github-slugger';
import remarkParse from 'remark-parse';
import { unified } from 'unified';

type MdastNode = {
  type: string;
  depth?: number;
  value?: string;
  children?: MdastNode[];
};

function nodeText(node: MdastNode): string {
  if (node.value) {
    return node.value;
  }
  return (node.children ?? []).map(nodeText).join('');
}

export function extractToc(markdown: string): TocItem[] {
  const tree = unified().use(remarkParse).parse(markdown) as MdastNode;
  const slugger = new GithubSlugger();
  const items: TocItem[] = [];

  for (const node of tree.children ?? []) {
    if (node.type !== 'heading' || node.depth == null) {
      continue;
    }
    if (node.depth > 3) {
      continue;
    }
    const title = nodeText(node).trim();
    if (!title) {
      continue;
    }
    items.push({
      id: slugger.slug(title),
      title,
      depth: node.depth === 3 ? 3 : 2,
    });
  }

  return items;
}
