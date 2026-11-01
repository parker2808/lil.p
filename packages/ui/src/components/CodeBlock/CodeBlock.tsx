'use client';

import { Badge } from '@portfolio/ui/components/ui/badge';
import { cn } from '@portfolio/ui/lib/utils';
import { type ReactNode, useState } from 'react';

export function CodeBlock({
  code,
  language,
  filename,
  labels,
  children,
  className,
}: {
  code: string;
  language: string;
  filename?: string;
  labels: { copy: string; copied: string; wrap: string };
  children: ReactNode;
  className?: string;
}) {
  const [copied, setCopied] = useState(false);
  const [wrap, setWrap] = useState(false);

  async function onCopy() {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1500);
  }

  return (
    <figure
      data-slot="code-block"
      className={cn('border-border bg-muted my-6 overflow-hidden rounded-lg border', className)}
    >
      <figcaption className="border-border flex items-center gap-2 border-b px-3 py-2">
        {filename ? <span className="text-eyebrow font-mono">{filename}</span> : null}
        <Badge variant="outline" className="normal-case">
          {language}
        </Badge>
        <button
          type="button"
          className="tap text-eyebrow text-muted-foreground hover:text-foreground ml-auto font-mono"
          onClick={() => setWrap((value) => !value)}
        >
          {labels.wrap}
        </button>
        <button
          type="button"
          className="tap text-eyebrow text-muted-foreground hover:text-foreground font-mono"
          onClick={() => void onCopy()}
        >
          {copied ? labels.copied : labels.copy}
        </button>
        <span className="sr-only" aria-live="polite">
          {copied ? labels.copied : ''}
        </span>
      </figcaption>
      <div
        tabIndex={0}
        className={cn('text-meta overflow-x-auto p-4 font-mono', wrap && 'whitespace-pre-wrap')}
      >
        {children}
      </div>
    </figure>
  );
}
