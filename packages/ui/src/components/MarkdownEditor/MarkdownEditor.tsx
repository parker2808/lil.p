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
import { useMarkdownEditorGroupMode } from './MarkdownEditorGroup';
import type { MarkdownEditorLabels, MarkdownEditorMode, MarkdownEditorVariant } from './types';

export function MarkdownEditor({
  value,
  onChange,
  onBlur,
  onReady,
  editable = true,
  variant = 'full',
  labels,
  ariaLabel,
  renderPreview,
  onUploadImage,
  onPickImage,
  className,
}: {
  value: string;
  onChange: (markdown: string) => void;
  onBlur?: () => void;
  onReady?: (getMarkdown: () => string) => void;
  editable?: boolean;
  variant?: MarkdownEditorVariant;
  labels: MarkdownEditorLabels;
  ariaLabel?: string;
  renderPreview?: (markdown: string) => ReactNode | Promise<ReactNode>;
  onUploadImage?: (file: File) => Promise<{ src: string; alt: string }>;
  onPickImage?: () => Promise<{ src: string; alt: string } | null>;
  className?: string;
}) {
  const groupMode = useMarkdownEditorGroupMode();
  const [ownMode, setMode] = useState<MarkdownEditorMode>('write');
  const mode = groupMode ?? ownMode;
  const [preview, setPreview] = useState<ReactNode>(null);
  const lastEmitted = useRef(value);
  const changeTimer = useRef<number | undefined>(undefined);
  const previewTimer = useRef<number | undefined>(undefined);
  const readyRef = useRef(false);
  const uploadRef = useRef(onUploadImage);
  uploadRef.current = onUploadImage;
  const [pendingAlt, setPendingAlt] = useState<{ src: string; alt: string } | null>(null);

  const editor = useEditor({
    immediatelyRender: false,
    shouldRerenderOnTransaction: true,
    extensions: createMarkdownExtensions({
      labels,
      onUploadImage: async (file) => {
        const uploaded = await uploadRef.current?.(file);
        if (uploaded) {
          setPendingAlt(uploaded);
        }
        return uploaded;
      },
    }),
    content: value,
    contentType: 'markdown',
    editable,
    editorProps: {
      attributes: {
        class: 'max-w-measure text-prose px-4 py-3 focus:outline-none',
        ...(ariaLabel ? { 'aria-label': ariaLabel } : {}),
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
          ...(ariaLabel ? { 'aria-label': ariaLabel } : {}),
          ...(editable ? {} : { 'aria-readonly': 'true' }),
        },
      },
    });
  }, [ariaLabel, editable, editor]);

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

  const toolbar =
    editor && editable ? (
      <EditorToolbar
        editor={editor}
        labels={labels}
        variant={variant}
        pendingAlt={pendingAlt}
        onPendingAltChange={setPendingAlt}
        onPickImage={onPickImage}
      />
    ) : null;
  const writeSurface = (
    <>
      {toolbar}
      <Prose>
        <EditorContent editor={editor} onBlur={flush} />
      </Prose>
    </>
  );
  const previewSurface = <Prose className="p-4">{preview}</Prose>;

  return (
    <TooltipProvider delayDuration={200}>
      <div
        data-slot="markdown-editor"
        className={cn(
          'redesign-markdown-editor',
          'border-border bg-card overflow-hidden rounded-lg border',
          className,
        )}
      >
        {groupMode === 'preview' ? previewSurface : null}
        {groupMode === 'write' ? (
          <>
            {writeSurface}
            <p className="border-border text-ui-meta text-muted-foreground border-t px-4 py-1 text-right">
              {wordLabel}
            </p>
          </>
        ) : null}
        {groupMode ? null : (
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
            <TabsContent value="write">{writeSurface}</TabsContent>
            <TabsContent value="split" className="hidden xl:block">
              <ResizablePanelGroup direction="horizontal">
                <ResizablePanel defaultSize={50} minSize={30}>
                  {writeSurface}
                </ResizablePanel>
                <ResizableHandle />
                <ResizablePanel defaultSize={50} minSize={30}>
                  {previewSurface}
                </ResizablePanel>
              </ResizablePanelGroup>
            </TabsContent>
            <TabsContent value="preview">{previewSurface}</TabsContent>
            <TabsContent value="markdown">
              <pre className="text-meta max-h-[32rem] overflow-auto p-4 font-mono whitespace-pre-wrap">
                {markdown}
              </pre>
            </TabsContent>
          </Tabs>
        )}
      </div>
    </TooltipProvider>
  );
}
