import { isAllowedMarkdownUrl } from '@portfolio/contracts';
import Link from '@tiptap/extension-link';

export const SafeLink = Link.extend({
  parseMarkdown(token, helpers) {
    const content = helpers.parseInline(token.tokens || []);
    const href = String(token.href ?? '');
    if (!isAllowedMarkdownUrl(href)) {
      return content;
    }
    return helpers.applyMark('link', content, {
      href,
      title: token.title || null,
    });
  },
  renderMarkdown(node, helpers) {
    const href = String(node.attrs?.href ?? '');
    const text = helpers.renderChildren(node);
    if (!isAllowedMarkdownUrl(href)) {
      return text;
    }
    const title = node.attrs?.title ? ` "${node.attrs.title}"` : '';
    return `[${text}](${href}${title})`;
  },
});
