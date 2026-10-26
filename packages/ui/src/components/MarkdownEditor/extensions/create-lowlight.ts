import { MARKDOWN_CODE_LANGUAGES } from '@portfolio/contracts';
import bash from 'highlight.js/lib/languages/bash';
import css from 'highlight.js/lib/languages/css';
import diff from 'highlight.js/lib/languages/diff';
import javascript from 'highlight.js/lib/languages/javascript';
import json from 'highlight.js/lib/languages/json';
import markdown from 'highlight.js/lib/languages/markdown';
import sql from 'highlight.js/lib/languages/sql';
import typescript from 'highlight.js/lib/languages/typescript';
import xml from 'highlight.js/lib/languages/xml';
import yaml from 'highlight.js/lib/languages/yaml';
import { createLowlight } from 'lowlight';

const GRAMMARS: Record<string, typeof typescript> = {
  ts: typescript,
  tsx: typescript,
  js: javascript,
  jsx: javascript,
  json,
  bash,
  css,
  html: xml,
  sql,
  yaml,
  md: markdown,
  diff,
  vue: xml,
};

export function createEditorLowlight() {
  const lowlight = createLowlight();
  for (const language of MARKDOWN_CODE_LANGUAGES) {
    const grammar = GRAMMARS[language];
    if (grammar) {
      lowlight.register(language, grammar);
    }
  }
  return lowlight;
}
