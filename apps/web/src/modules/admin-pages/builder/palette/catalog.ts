import type { TreeNode } from '@parker2808/cms-core/tree';

export type PaletteKind =
  'section' | 'row' | 'grid' | 'heading' | 'paragraph' | 'image' | 'button' | 'divider' | 'spacer';
export const paletteKinds: PaletteKind[] = [
  'section',
  'row',
  'grid',
  'heading',
  'paragraph',
  'image',
  'button',
  'divider',
  'spacer',
];

export function newNode(kind: PaletteKind, id: () => string, locale: 'en' | 'vi' = 'en'): TreeNode {
  const nodeId = id();
  const responsive = (base: Record<string, string | number>) => ({ base });
  switch (kind) {
    case 'section':
      return { id: nodeId, type: 'section', responsive: responsive({}), content: [] };
    case 'row':
      return {
        id: nodeId,
        type: 'row',
        responsive: responsive({}),
        columns: [
          { id: id(), type: 'column', responsive: responsive({ span: 1 }), content: [] },
          { id: id(), type: 'column', responsive: responsive({ span: 1 }), content: [] },
        ],
      };
    case 'grid':
      return { id: nodeId, type: 'grid', responsive: responsive({ columns: 2 }), items: [] };
    case 'heading':
      return {
        id: nodeId,
        type: 'component',
        componentType: kind,
        responsive: responsive({ text: locale === 'vi' ? 'Tiêu đề' : 'Heading', level: 2 }),
      };
    case 'paragraph':
      return {
        id: nodeId,
        type: 'component',
        componentType: kind,
        responsive: responsive({
          text: locale === 'vi' ? 'Viết nội dung tại đây.' : 'Write something meaningful here.',
        }),
      };
    case 'image':
      return {
        id: nodeId,
        type: 'component',
        componentType: kind,
        responsive: responsive({
          src: '/placeholder.svg',
          alt: locale === 'vi' ? 'Hình giữ chỗ' : 'Placeholder image',
        }),
      };
    case 'button':
      return {
        id: nodeId,
        type: 'component',
        componentType: kind,
        responsive: responsive({ label: locale === 'vi' ? 'Khám phá' : 'Explore', href: '/' }),
      };
    case 'divider':
      return { id: nodeId, type: 'component', componentType: kind, responsive: responsive({}) };
    case 'spacer':
      return {
        id: nodeId,
        type: 'component',
        componentType: kind,
        responsive: responsive({ size: 'md' }),
      };
  }
}
