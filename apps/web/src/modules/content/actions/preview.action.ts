'use server';

import type { Root } from 'hast';

import { markdownToHast } from '../services/markdown-to-hast';

export async function previewMarkdown(source: string): Promise<Root | null> {
  return markdownToHast(source);
}
