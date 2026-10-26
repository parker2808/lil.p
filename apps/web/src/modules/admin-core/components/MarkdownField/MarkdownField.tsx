'use client';

import type { MarkdownEditorLabels } from '@portfolio/ui/components/MarkdownEditor/types';
import { Skeleton } from '@portfolio/ui/components/ui/skeleton';
import dynamic from 'next/dynamic';
import { useCallback, useRef, useState } from 'react';

import { MediaPickerDialog } from '@/modules/admin-media/components/MediaPickerDialog/MediaPickerDialog';
import { publicMediaSrc } from '@/modules/admin-media/services/admin-media.service';
import { uploadMedia } from '@/modules/admin-media/services/media-upload.service';
import { previewMarkdown } from '@/modules/content/actions/preview.action';
import { hastToReact } from '@/modules/content/utils/hast-to-react.util';

const MarkdownEditor = dynamic(
  () =>
    import('@portfolio/ui/components/MarkdownEditor/MarkdownEditor').then(
      (module) => module.MarkdownEditor,
    ),
  { ssr: false, loading: () => <Skeleton className="h-64 w-full" /> },
);

export function MarkdownField({
  value,
  onChange,
  onBlur,
  onBaseline,
  labels,
  previewLabels,
  readOnly,
  variant,
}: {
  value: string;
  onChange: (markdown: string) => void;
  onBlur?: () => void;
  onBaseline?: (markdown: string) => void;
  labels: MarkdownEditorLabels;
  previewLabels: {
    copy: string;
    copied: string;
    wrap: string;
    note: string;
    warning: string;
    anchor: string;
  };
  readOnly?: boolean;
  variant?: 'full' | 'compact';
}) {
  const onReady = useCallback(
    (getMarkdown: () => string) => {
      const next = getMarkdown();
      onBaseline?.(next);
      if (next !== value) {
        onChange(next);
      }
    },
    [onBaseline, onChange, value],
  );

  const renderPreview = useCallback(
    async (markdown: string) => {
      const tree = await previewMarkdown(markdown);
      return tree ? hastToReact(tree, previewLabels) : null;
    },
    [previewLabels],
  );

  const [pickerOpen, setPickerOpen] = useState(false);
  const pickRef = useRef<((value: { src: string; alt: string } | null) => void) | null>(null);

  const onUploadImage = useCallback(async (file: File) => {
    const media = await uploadMedia(file);
    return { src: publicMediaSrc(media.fileName), alt: media.altEn };
  }, []);

  const onPickImage = useCallback(() => {
    return new Promise<{ src: string; alt: string } | null>((resolve) => {
      pickRef.current = resolve;
      setPickerOpen(true);
    });
  }, []);

  return (
    <>
      <MarkdownEditor
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        onReady={onReady}
        editable={!readOnly}
        variant={variant}
        labels={labels}
        renderPreview={renderPreview}
        onUploadImage={readOnly ? undefined : onUploadImage}
        onPickImage={readOnly ? undefined : onPickImage}
      />
      <MediaPickerDialog
        open={pickerOpen}
        accept="image"
        onOpenChange={(open) => {
          setPickerOpen(open);
          if (!open) {
            pickRef.current?.(null);
            pickRef.current = null;
          }
        }}
        onPick={(media) => {
          pickRef.current?.({ src: publicMediaSrc(media.fileName), alt: media.altEn });
          pickRef.current = null;
        }}
      />
    </>
  );
}
