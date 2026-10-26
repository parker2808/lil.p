import 'server-only';

import type { ReactNode } from 'react';

import { hastToReact, type MarkdownLabels } from '../utils/hast-to-react.util';
import { markdownToHast } from './markdown-to-hast';

export type { MarkdownLabels };

export async function renderMarkdown(source: string, labels: MarkdownLabels): Promise<ReactNode> {
  const tree = await markdownToHast(source);
  return tree ? hastToReact(tree, labels) : null;
}
