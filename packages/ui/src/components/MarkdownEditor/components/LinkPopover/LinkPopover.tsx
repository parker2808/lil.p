'use client';

import { isAllowedMarkdownUrl } from '@portfolio/contracts';
import { Button } from '@portfolio/ui/components/ui/button';
import { Input } from '@portfolio/ui/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@portfolio/ui/components/ui/popover';
import type { Editor } from '@tiptap/react';
import { Link as LinkIcon } from 'lucide-react';
import { useState } from 'react';

import type { MarkdownEditorLabels } from '../../types';
import { ToolbarIconButton } from '../EditorToolbar/ToolbarIconButton';

export function LinkPopover({ editor, labels }: { editor: Editor; labels: MarkdownEditorLabels }) {
  const [open, setOpen] = useState(false);
  const [url, setUrl] = useState(editor.getAttributes('link').href ?? '');

  function apply() {
    if (!isAllowedMarkdownUrl(url)) {
      return;
    }
    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
    setOpen(false);
  }

  function remove() {
    editor.chain().focus().unsetLink().run();
    setUrl('');
    setOpen(false);
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <ToolbarIconButton
          pressed={editor.isActive('link')}
          label={labels.link}
          shortcut={labels.shortcuts.link}
        >
          <LinkIcon className="size-3.5" />
        </ToolbarIconButton>
      </PopoverTrigger>
      <PopoverContent className="flex w-72 flex-col gap-2 p-2">
        <Input
          value={url}
          onChange={(event) => setUrl(event.target.value)}
          aria-label={labels.linkUrl}
          onKeyDown={(event) => {
            if (event.key === 'Enter') {
              event.preventDefault();
              apply();
            }
          }}
        />
        <div className="flex justify-end gap-2">
          <Button type="button" variant="ghost" size="sm" onClick={remove}>
            {labels.linkRemove}
          </Button>
          <Button type="button" size="sm" onClick={apply} disabled={!isAllowedMarkdownUrl(url)}>
            {labels.linkApply}
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
