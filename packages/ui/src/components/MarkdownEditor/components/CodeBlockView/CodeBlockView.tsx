'use client';

import { MARKDOWN_CODE_LANGUAGES } from '@portfolio/contracts';
import { Badge } from '@portfolio/ui/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@portfolio/ui/components/ui/select';
import { NodeViewContent, NodeViewWrapper, type ReactNodeViewProps } from '@tiptap/react';

const PLAIN = 'text';

export function CodeBlockView({
  node,
  updateAttributes,
  editor,
  plainText,
  languageLabel,
}: ReactNodeViewProps & { plainText: string; languageLabel: string }) {
  const language = String(node.attrs.language ?? '') || PLAIN;
  const plainLabel = plainText;

  return (
    <NodeViewWrapper>
      <figure
        data-slot="code-block"
        className="border-border bg-muted my-6 overflow-hidden rounded-lg border"
      >
        <figcaption className="border-border flex items-center gap-2 border-b px-3 py-2">
          {editor.isEditable ? (
            <Select
              value={language}
              onValueChange={(value) =>
                updateAttributes({ language: value === PLAIN ? '' : value })
              }
            >
              <SelectTrigger aria-label={languageLabel} className="h-7 w-36">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={PLAIN}>{plainLabel}</SelectItem>
                {MARKDOWN_CODE_LANGUAGES.map((item) => (
                  <SelectItem key={item} value={item}>
                    {item}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : (
            <Badge variant="outline" className="normal-case">
              {language}
            </Badge>
          )}
        </figcaption>
        <pre className="text-meta overflow-x-auto p-4 font-mono">
          <NodeViewContent />
        </pre>
      </figure>
    </NodeViewWrapper>
  );
}
