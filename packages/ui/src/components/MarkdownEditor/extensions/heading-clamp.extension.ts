import Heading from '@tiptap/extension-heading';

function clampLevel(level: number): 2 | 3 {
  return level >= 3 ? 3 : 2;
}

export const ClampedHeading = Heading.extend({
  name: 'heading',
  parseMarkdown(token, helpers) {
    return helpers.createNode(
      'heading',
      { level: clampLevel(Number(token.depth ?? 2)) },
      helpers.parseInline(token.tokens || []),
    );
  },
});
