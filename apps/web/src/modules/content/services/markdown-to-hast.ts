import 'server-only';

import { MARKDOWN_CALLOUT_KINDS, MARKDOWN_CODE_LANGUAGES } from '@portfolio/contracts';
import type { Element, ElementContent, Root, RootContent, Text } from 'hast';
import rehypeSanitize, { defaultSchema } from 'rehype-sanitize';
import rehypeSlug from 'rehype-slug';
import remarkGfm from 'remark-gfm';
import remarkParse from 'remark-parse';
import remarkRehype from 'remark-rehype';
import { createHighlighter, type Highlighter } from 'shiki';
import { unified } from 'unified';
import { visit } from 'unist-util-visit';

import { SHIKI_THEME_NAME, shikiCssTheme } from '../constants/shiki-theme.constant';

const CALLOUT_RE = /^\[!(NOTE|WARNING)\]\s*/;
const LANGUAGE_RE = /(?:^| )language-([a-z0-9+-]+)/i;
const ALLOWED_LANGS = new Set<string>(MARKDOWN_CODE_LANGUAGES);

export const sanitizeSchema = {
  ...defaultSchema,
  clobberPrefix: '',
  tagNames: [
    'h1',
    'h2',
    'h3',
    'p',
    'strong',
    'em',
    'del',
    's',
    'code',
    'pre',
    'a',
    'ul',
    'ol',
    'li',
    'blockquote',
    'hr',
    'br',
    'img',
    'table',
    'thead',
    'tbody',
    'tr',
    'th',
    'td',
  ],
  attributes: {
    ...defaultSchema.attributes,
    a: [...(defaultSchema.attributes?.a ?? []), 'href'],
    img: [...(defaultSchema.attributes?.img ?? []), 'src', 'alt'],
    code: [...(defaultSchema.attributes?.code ?? []), 'className', 'class'],
    pre: [
      ...(defaultSchema.attributes?.pre ?? []),
      'className',
      'class',
      'dataLanguage',
      'dataFilename',
      'dataCode',
    ],
    h1: ['id'],
    h2: ['id'],
    h3: ['id'],
  },
  protocols: {
    ...defaultSchema.protocols,
    href: ['http', 'https', 'mailto'],
    src: [],
  },
};

let highlighterPromise: Promise<Highlighter> | undefined;

function getHighlighter(): Promise<Highlighter> {
  highlighterPromise ??= createHighlighter({
    themes: [shikiCssTheme],
    langs: [...MARKDOWN_CODE_LANGUAGES],
  });
  return highlighterPromise;
}

function isElement(node: RootContent | ElementContent | undefined): node is Element {
  return Boolean(node && node.type === 'element');
}

function isText(node: RootContent | ElementContent | undefined): node is Text {
  return Boolean(node && node.type === 'text');
}

function nodeText(node: RootContent | ElementContent): string {
  if (isText(node)) {
    return node.value;
  }
  if (isElement(node)) {
    return node.children.map(nodeText).join('');
  }
  return '';
}

function classNameOf(node: Element): string {
  const value = node.properties?.className;
  if (Array.isArray(value)) {
    return value.map(String).join(' ');
  }
  return value == null ? '' : String(value);
}

function languageOf(code: Element): string {
  const match = classNameOf(code).match(LANGUAGE_RE);
  return match?.[1]?.toLowerCase() ?? '';
}

function filenameOf(code: Element): string {
  const meta = (code.data as { meta?: string } | undefined)?.meta ?? '';
  const titled = meta.match(/(?:filename|title)=(?:"([^"]+)"|'([^']+)'|(\S+))/);
  if (titled) {
    return titled[1] ?? titled[2] ?? titled[3] ?? '';
  }
  return meta.trim();
}

function rehypeDemoteH1() {
  return (tree: Root) => {
    visit(tree, 'element', (node) => {
      if (node.tagName === 'h1') {
        node.tagName = 'h2';
      }
    });
  };
}

function rehypeAnnotateCode() {
  return (tree: Root) => {
    visit(tree, 'element', (node) => {
      if (node.tagName !== 'pre') {
        return;
      }
      const code = node.children.find(
        (child): child is Element => isElement(child) && child.tagName === 'code',
      );
      if (!code) {
        return;
      }
      node.properties = {
        ...node.properties,
        dataLanguage: languageOf(code),
        dataFilename: filenameOf(code),
        dataCode: nodeText(code),
      };
    });
  };
}

function rehypeCallouts() {
  return (tree: Root) => {
    visit(tree, 'element', (node) => {
      if (node.tagName !== 'blockquote') {
        return;
      }
      const first = node.children.find(isElement);
      if (!first || first.tagName !== 'p') {
        return;
      }
      const raw = nodeText(first);
      const match = raw.match(CALLOUT_RE);
      if (
        !match ||
        !MARKDOWN_CALLOUT_KINDS.includes(match[1] as (typeof MARKDOWN_CALLOUT_KINDS)[number])
      ) {
        return;
      }

      node.tagName = 'aside';
      node.properties = { ...node.properties, dataCallout: match[1] };

      const firstText = first.children.find(isText);
      if (firstText) {
        firstText.value = firstText.value.replace(CALLOUT_RE, '');
      }
      if (!nodeText(first).trim()) {
        node.children = node.children.filter((child) => child !== first);
      }
    });
  };
}

function rehypeShiki(highlighter: Highlighter) {
  return (tree: Root) => {
    visit(tree, 'element', (node) => {
      if (node.tagName !== 'pre') {
        return;
      }
      const language = String(node.properties?.dataLanguage ?? '');
      const code = String(node.properties?.dataCode ?? '');
      if (!code || !ALLOWED_LANGS.has(language)) {
        return;
      }
      try {
        const highlighted = highlighter.codeToHast(code, {
          lang: language,
          theme: SHIKI_THEME_NAME,
        });
        const pre = highlighted.children.find(
          (child): child is Element => isElement(child) && child.tagName === 'pre',
        );
        if (!pre) {
          return;
        }
        node.children = pre.children;
        node.properties = {
          ...pre.properties,
          dataLanguage: language,
          dataFilename: node.properties?.dataFilename,
          dataCode: code,
        };
      } catch {
        // unknown grammar: leave the fenced block as plain text
      }
    });
  };
}

export async function markdownToHast(source: string): Promise<Root | null> {
  if (!source.trim()) {
    return null;
  }

  const highlighter = await getHighlighter();
  const processor = unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkRehype, { allowDangerousHtml: false })
    .use(rehypeDemoteH1)
    .use(rehypeSlug)
    .use(rehypeSanitize, sanitizeSchema)
    .use(rehypeAnnotateCode)
    .use(rehypeCallouts)
    .use(() => rehypeShiki(highlighter));

  return (await processor.run(processor.parse(source))) as Root;
}
