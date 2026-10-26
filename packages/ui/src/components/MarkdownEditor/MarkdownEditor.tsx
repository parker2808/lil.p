'use client';

import { Prose } from '@portfolio/ui/components/Prose/Prose';
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from '@portfolio/ui/components/ui/resizable';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@portfolio/ui/components/ui/tabs';
import { TooltipProvider } from '@portfolio/ui/components/ui/tooltip';
import { cn } from '@portfolio/ui/lib/utils';
import { EditorContent, useEditor } from '@tiptap/react';
import { type ReactNode, useEffect, useRef, useState } from 'react';

import { EditorToolbar } from './components/EditorToolbar/EditorToolbar';
import { createMarkdownExtensions } from './extensions/create-markdown-extensions';
import type { MarkdownEditorLabels, MarkdownEditorMode, MarkdownEditorVariant } from './types';

export function MarkdownEditor({
  value,
  onChange,
  onBlur,
  onReady,
  editable = true,
  variant = 'full',
  labels,
  renderPreview,
  className,
}: {
  value: string;
  onChange: (markdown: string) => void;
  onBlur?: () => void;
  onReady?: (getMarkdown: () => string) => void;
  editable?: boolean;
  variant?: MarkdownEditorVariant;
  labels: MarkdownEditorLabels;
  renderPreview?: (markdown: string) => ReactNode | Promise<ReactNode>;
  onUploadImage?: (file: File) => Promise<{ src: string; alt: string }>;
  className?: string;
}) {
  const [mode, setMode] = useState<MarkdownEditorMode>('write');
  const [preview, setPreview] = useState<ReactNode>(null);
  const lastEmitted = useRef(value);
  const changeTimer = useRef<number | undefined>(undefined);
  const previewTimer = useRef<number | undefined>(undefined);
  const readyRef = useRef(false);

  const editor = useEditor({
    immediatelyRender: false,
    shouldRerenderOnTransaction: true,
    extensions: createMarkdownExtensions({ labels }),
    content: value,
    contentType: 'markdown',
    editable,
    editorProps: {
      attributes: {
        class: 'max-w-measure text-prose px-4 py-3 focus:outline-none',
        ...(editable ? {} : { 'aria-readonly': 'true' }),
      },
    },
    onUpdate: ({ editor: instance }) => {
      window.clearTimeout(changeTimer.current);
      changeTimer.current = window.setTimeout(() => {
        const markdown = instance.getMarkdown();
        lastEmitted.current = markdown;
        onChange(markdown);
      }, 250);
    },
    onCreate: ({ editor: instance }) => {
      if (!readyRef.current) {
        readyRef.current = true;
        lastEmitted.current = instance.getMarkdown();
        onReady?.(() => instance.getMarkdown());
      }
    },
  });

  useEffect(() => {
    if (!editor) {
      return;
    }
    editor.setEditable(editable);
    editor.setOptions({
      editorProps: {
        attributes: {
          class: 'max-w-measure text-prose px-4 py-3 focus:outline-none',
          ...(editable ? {} : { 'aria-readonly': 'true' }),
        },
      },
    });
  }, [editable, editor]);

  useEffect(() => {
    if (!editor || value === lastEmitted.current) {
      return;
    }
    editor.commands.setContent(value, { contentType: 'markdown', emitUpdate: false });
    lastEmitted.current = value;
  }, [editor, value]);

  useEffect(() => {
    if (!editor || (mode !== 'preview' && mode !== 'split') || !renderPreview) {
      return;
    }
    window.clearTimeout(previewTimer.current);
    previewTimer.current = window.setTimeout(() => {
      const result = renderPreview(editor.getMarkdown());
      if (result && typeof result === 'object' && 'then' in result) {
        void Promise.resolve(result).then(setPreview);
        return;
      }
      setPreview(result);
    }, 500);
    return () => window.clearTimeout(previewTimer.current);
  }, [editor, mode, renderPreview, value]);

  useEffect(() => {
    return () => {
      window.clearTimeout(changeTimer.current);
      window.clearTimeout(previewTimer.current);
    };
  }, []);

  const markdown = editor?.getMarkdown() ?? value;
  const words = editor?.storage.characterCount?.words() ?? 0;
  const wordLabel = labels.words.replace('{count}', String(words));

  function flush() {
    if (!editor) {
      return;
    }
    window.clearTimeout(changeTimer.current);
    const next = editor.getMarkdown();
    lastEmitted.current = next;
    onChange(next);
    onBlur?.();
  }

  return (
    <TooltipProvider delayDuration={200}>
      <div
        data-slot="markdown-editor"
        className={cn('border-border bg-card overflow-hidden rounded-lg border', className)}
      >
        <Tabs
          value={mode}
          onValueChange={(next) => {
            flush();
            setMode(next as MarkdownEditorMode);
          }}
        >
          <div className="border-border flex items-center justify-between border-b px-2 py-1">
            <TabsList>
              <TabsTrigger value="write">{labels.write}</TabsTrigger>
              <TabsTrigger value="split" className="hidden xl:inline-flex">
                {labels.split}
              </TabsTrigger>
              <TabsTrigger value="preview">{labels.preview}</TabsTrigger>
              <TabsTrigger value="markdown">{labels.markdown}</TabsTrigger>
            </TabsList>
            <p className="text-ui-meta text-muted-foreground px-2">{wordLabel}</p>
          </div>
          <TabsContent value="write">
            {editor && editable ? (
              <EditorToolbar editor={editor} labels={labels} variant={variant} />
            ) : null}
            <Prose>
              <EditorContent editor={editor} onBlur={flush} />
            </Prose>
          </TabsContent>
          <TabsContent value="split" className="hidden xl:block">
            <ResizablePanelGroup direction="horizontal">
              <ResizablePanel defaultSize={50} minSize={30}>
                {editor && editable ? (
                  <EditorToolbar editor={editor} labels={labels} variant={variant} />
                ) : null}
                <Prose>
                  <EditorContent editor={editor} onBlur={flush} />
                </Prose>
              </ResizablePanel>
              <ResizableHandle />
              <ResizablePanel defaultSize={50} minSize={30}>
                <Prose className="p-4">{preview}</Prose>
              </ResizablePanel>
            </ResizablePanelGroup>
          </TabsContent>
          <TabsContent value="preview">
            <Prose className="p-4">{preview}</Prose>
          </TabsContent>
          <TabsContent value="markdown">
            <pre className="text-meta max-h-[32rem] overflow-auto p-4 font-mono whitespace-pre-wrap">
              {markdown}
            </pre>
          </TabsContent>
        </Tabs>
      </div>
    </TooltipProvider>
  );
}
