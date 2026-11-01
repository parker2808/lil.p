'use client';

import { isAllowedImageSrc } from '@portfolio/contracts';
import { Button } from '@portfolio/ui/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from '@portfolio/ui/components/ui/dropdown-menu';
import { Input } from '@portfolio/ui/components/ui/input';
import { Kbd } from '@portfolio/ui/components/ui/kbd';
import {
  Popover,
  PopoverAnchor,
  PopoverContent,
  PopoverTrigger,
} from '@portfolio/ui/components/ui/popover';
import { Separator } from '@portfolio/ui/components/ui/separator';
import { Toggle } from '@portfolio/ui/components/ui/toggle';
import { ToggleGroup, ToggleGroupItem } from '@portfolio/ui/components/ui/toggle-group';
import { Tooltip, TooltipContent, TooltipTrigger } from '@portfolio/ui/components/ui/tooltip';
import type { Editor } from '@tiptap/react';
import {
  Bold,
  Code,
  Ellipsis,
  Heading2,
  ImageIcon,
  Italic,
  List,
  ListOrdered,
  Minus,
  Quote,
  Redo2,
  Strikethrough,
  Table,
  Undo2,
} from 'lucide-react';
import { type KeyboardEvent, useEffect, useMemo, useRef, useState } from 'react';

import type { MarkdownEditorLabels, MarkdownEditorVariant } from '../../types';
import { LinkPopover } from '../LinkPopover/LinkPopover';
import { ToolbarIconButton } from './ToolbarIconButton';

function markValue(editor: Editor): string[] {
  return ['bold', 'italic', 'strike', 'code'].filter((name) => editor.isActive(name));
}

export function EditorToolbar({
  editor,
  labels,
  variant,
  pendingAlt,
  onPendingAltChange,
  onPickImage,
}: {
  editor: Editor;
  labels: MarkdownEditorLabels;
  variant: MarkdownEditorVariant;
  pendingAlt?: { src: string; alt: string } | null;
  onPendingAltChange?: (value: { src: string; alt: string } | null) => void;
  onPickImage?: () => Promise<{ src: string; alt: string } | null>;
}) {
  const [imageOpen, setImageOpen] = useState(false);
  const [imageSrc, setImageSrc] = useState('');
  const [imageAlt, setImageAlt] = useState('');
  const imageFromMenu = useRef(false);

  useEffect(() => {
    if (!pendingAlt) {
      return;
    }
    setImageOpen(true);
    setImageSrc(pendingAlt.src);
    setImageAlt(pendingAlt.alt);
    onPendingAltChange?.(null);
  }, [onPendingAltChange, pendingAlt]);

  const compact = variant === 'compact';
  const controls = useMemo(() => {
    const ids = ['undo', 'redo', 'bold', 'italic', 'link', 'bullet', 'ordered'];
    if (!compact) {
      ids.splice(2, 0, 'block');
      ids.push('strike', 'code', 'quote', 'callout', 'codeBlock', 'image', 'table');
    }
    return ids;
  }, [compact]);

  function onToolbarKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key !== 'ArrowRight' && event.key !== 'ArrowLeft') {
      return;
    }
    const buttons = Array.from(
      event.currentTarget.querySelectorAll<HTMLElement>('button, [role="radio"]'),
    ).filter((button) => button.getClientRects().length > 0);
    const index = buttons.indexOf(document.activeElement as HTMLElement);
    if (index < 0) {
      return;
    }
    event.preventDefault();
    const next =
      event.key === 'ArrowRight'
        ? (index + 1) % buttons.length
        : (index - 1 + buttons.length) % buttons.length;
    buttons[next]?.focus();
  }

  function insertImage() {
    if (!isAllowedImageSrc(imageSrc) || !imageAlt.trim()) {
      return;
    }
    editor.chain().focus().setImage({ src: imageSrc, alt: imageAlt.trim() }).run();
    setImageOpen(false);
    setImageSrc('');
    setImageAlt('');
  }

  function pickImage() {
    if (!onPickImage) {
      return;
    }
    void onPickImage().then((picked) => {
      if (!picked || !isAllowedImageSrc(picked.src)) {
        return;
      }
      editor.chain().focus().setImage({ src: picked.src, alt: picked.alt }).run();
      if (!picked.alt.trim()) {
        setImageSrc(picked.src);
        setImageAlt('');
        setImageOpen(true);
      }
    });
  }

  const calloutItems = (
    <>
      <DropdownMenuItem onSelect={() => editor.chain().focus().setCallout('NOTE').run()}>
        {labels.note}
      </DropdownMenuItem>
      <DropdownMenuItem onSelect={() => editor.chain().focus().setCallout('WARNING').run()}>
        {labels.warning}
      </DropdownMenuItem>
    </>
  );
  const tableItems = (
    <>
      <DropdownMenuItem
        onSelect={() =>
          editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()
        }
      >
        {labels.tableInsert}
      </DropdownMenuItem>
      <DropdownMenuItem onSelect={() => editor.chain().focus().addRowAfter().run()}>
        {labels.tableAddRow}
      </DropdownMenuItem>
      <DropdownMenuItem onSelect={() => editor.chain().focus().addColumnAfter().run()}>
        {labels.tableAddColumn}
      </DropdownMenuItem>
      <DropdownMenuItem onSelect={() => editor.chain().focus().deleteRow().run()}>
        {labels.tableDeleteRow}
      </DropdownMenuItem>
      <DropdownMenuItem onSelect={() => editor.chain().focus().deleteColumn().run()}>
        {labels.tableDeleteColumn}
      </DropdownMenuItem>
      <DropdownMenuItem onSelect={() => editor.chain().focus().deleteTable().run()}>
        {labels.tableDelete}
      </DropdownMenuItem>
    </>
  );

  return (
    <Popover open={imageOpen} onOpenChange={setImageOpen}>
      <PopoverAnchor asChild>
        <div
          role="toolbar"
          aria-label={labels.write}
          onKeyDown={onToolbarKeyDown}
          className="border-border bg-card redesign-editor-toolbar sticky top-0 z-10 flex items-center gap-1 overflow-x-auto border-b px-2 py-1 *:shrink-0"
        >
          <ToolbarIconButton
            label={labels.undo}
            shortcut={labels.shortcuts.undo}
            onClick={() => editor.chain().focus().undo().run()}
          >
            <Undo2 className="size-3.5" />
          </ToolbarIconButton>
          <ToolbarIconButton
            label={labels.redo}
            shortcut={labels.shortcuts.redo}
            onClick={() => editor.chain().focus().redo().run()}
          >
            <Redo2 className="size-3.5" />
          </ToolbarIconButton>
          {compact ? null : (
            <>
              <Separator orientation="vertical" className="mx-1 h-5" />
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <ToolbarIconButton label={labels.heading2} shortcut={labels.shortcuts.heading2}>
                    <Heading2 className="size-3.5" />
                  </ToolbarIconButton>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onSelect={() => editor.chain().focus().setParagraph().run()}>
                    {labels.paragraph}
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onSelect={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                  >
                    {labels.heading2}
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onSelect={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
                  >
                    {labels.heading3}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          )}
          <Separator orientation="vertical" className="mx-1 h-5" />
          <ToggleGroup
            type="multiple"
            value={markValue(editor)}
            onValueChange={(value) => {
              const next = new Set(value);
              if (next.has('bold') !== editor.isActive('bold')) {
                editor.chain().focus().toggleBold().run();
              }
              if (next.has('italic') !== editor.isActive('italic')) {
                editor.chain().focus().toggleItalic().run();
              }
              if (!compact && next.has('strike') !== editor.isActive('strike')) {
                editor.chain().focus().toggleStrike().run();
              }
              if (!compact && next.has('code') !== editor.isActive('code')) {
                editor.chain().focus().toggleCode().run();
              }
            }}
          >
            <Tooltip>
              <TooltipTrigger asChild>
                <ToggleGroupItem value="bold" aria-label={labels.bold} className="size-7 p-0">
                  <Bold className="size-3.5" />
                </ToggleGroupItem>
              </TooltipTrigger>
              <TooltipContent className="flex items-center gap-2">
                <span>{labels.bold}</span>
                <Kbd>{labels.shortcuts.bold}</Kbd>
              </TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <ToggleGroupItem value="italic" aria-label={labels.italic} className="size-7 p-0">
                  <Italic className="size-3.5" />
                </ToggleGroupItem>
              </TooltipTrigger>
              <TooltipContent className="flex items-center gap-2">
                <span>{labels.italic}</span>
                <Kbd>{labels.shortcuts.italic}</Kbd>
              </TooltipContent>
            </Tooltip>
            {compact ? null : (
              <>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <ToggleGroupItem
                      value="strike"
                      aria-label={labels.strike}
                      className="size-7 p-0"
                    >
                      <Strikethrough className="size-3.5" />
                    </ToggleGroupItem>
                  </TooltipTrigger>
                  <TooltipContent className="flex items-center gap-2">
                    <span>{labels.strike}</span>
                    <Kbd>{labels.shortcuts.strike}</Kbd>
                  </TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <ToggleGroupItem
                      value="code"
                      aria-label={labels.inlineCode}
                      className="size-7 p-0"
                    >
                      <Code className="size-3.5" />
                    </ToggleGroupItem>
                  </TooltipTrigger>
                  <TooltipContent className="flex items-center gap-2">
                    <span>{labels.inlineCode}</span>
                    <Kbd>{labels.shortcuts.inlineCode}</Kbd>
                  </TooltipContent>
                </Tooltip>
              </>
            )}
          </ToggleGroup>
          <LinkPopover editor={editor} labels={labels} />
          <Separator orientation="vertical" className="mx-1 h-5" />
          <Tooltip>
            <TooltipTrigger asChild>
              <Toggle
                pressed={editor.isActive('bulletList')}
                aria-label={labels.bulletList}
                onPressedChange={() => editor.chain().focus().toggleBulletList().run()}
              >
                <List className="size-3.5" />
              </Toggle>
            </TooltipTrigger>
            <TooltipContent className="flex items-center gap-2">
              <span>{labels.bulletList}</span>
              <Kbd>{labels.shortcuts.bulletList}</Kbd>
            </TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Toggle
                pressed={editor.isActive('orderedList')}
                aria-label={labels.orderedList}
                onPressedChange={() => editor.chain().focus().toggleOrderedList().run()}
              >
                <ListOrdered className="size-3.5" />
              </Toggle>
            </TooltipTrigger>
            <TooltipContent className="flex items-center gap-2">
              <span>{labels.orderedList}</span>
              <Kbd>{labels.shortcuts.orderedList}</Kbd>
            </TooltipContent>
          </Tooltip>
          {compact ? null : (
            <>
              <div className="hidden items-center gap-1 *:shrink-0 sm:flex">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Toggle
                      pressed={editor.isActive('blockquote')}
                      aria-label={labels.quote}
                      onPressedChange={() => editor.chain().focus().toggleBlockquote().run()}
                    >
                      <Quote className="size-3.5" />
                    </Toggle>
                  </TooltipTrigger>
                  <TooltipContent className="flex items-center gap-2">
                    <span>{labels.quote}</span>
                    <Kbd>{labels.shortcuts.quote}</Kbd>
                  </TooltipContent>
                </Tooltip>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <ToolbarIconButton label={labels.note}>
                      <Quote className="size-3.5" />
                    </ToolbarIconButton>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>{calloutItems}</DropdownMenuContent>
                </DropdownMenu>
                <ToolbarIconButton
                  label={labels.codeBlock}
                  shortcut={labels.shortcuts.codeBlock}
                  pressed={editor.isActive('codeBlock')}
                  onClick={() => editor.chain().focus().toggleCodeBlock().run()}
                >
                  <Code className="size-3.5" />
                </ToolbarIconButton>
                <PopoverTrigger asChild>
                  <ToolbarIconButton label={labels.image} onClick={pickImage}>
                    <ImageIcon className="size-3.5" />
                  </ToolbarIconButton>
                </PopoverTrigger>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <ToolbarIconButton label={labels.table}>
                      <Table className="size-3.5" />
                    </ToolbarIconButton>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>{tableItems}</DropdownMenuContent>
                </DropdownMenu>
                <ToolbarIconButton
                  label={labels.divider}
                  onClick={() => editor.chain().focus().setHorizontalRule().run()}
                >
                  <Minus className="size-3.5" />
                </ToolbarIconButton>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <ToolbarIconButton label={labels.more} className="sm:hidden">
                    <Ellipsis className="size-3.5" />
                  </ToolbarIconButton>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  onCloseAutoFocus={(event) => {
                    if (!imageFromMenu.current) {
                      return;
                    }
                    imageFromMenu.current = false;
                    event.preventDefault();
                    setImageOpen(true);
                    pickImage();
                  }}
                >
                  <DropdownMenuItem
                    onSelect={() => editor.chain().focus().toggleBlockquote().run()}
                  >
                    {labels.quote}
                  </DropdownMenuItem>
                  {calloutItems}
                  <DropdownMenuItem onSelect={() => editor.chain().focus().toggleCodeBlock().run()}>
                    {labels.codeBlock}
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onSelect={() => {
                      imageFromMenu.current = true;
                    }}
                  >
                    {labels.image}
                  </DropdownMenuItem>
                  <DropdownMenuSub>
                    <DropdownMenuSubTrigger>{labels.table}</DropdownMenuSubTrigger>
                    <DropdownMenuSubContent>{tableItems}</DropdownMenuSubContent>
                  </DropdownMenuSub>
                  <DropdownMenuItem
                    onSelect={() => editor.chain().focus().setHorizontalRule().run()}
                  >
                    {labels.divider}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          )}
          <span className="sr-only">{controls.join(' ')}</span>
        </div>
      </PopoverAnchor>
      <PopoverContent className="flex w-72 flex-col gap-2 p-2">
        <Input
          value={imageSrc}
          onChange={(event) => setImageSrc(event.target.value)}
          aria-label={labels.imageUrl}
        />
        <Input
          value={imageAlt}
          onChange={(event) => setImageAlt(event.target.value)}
          aria-label={labels.imageAlt}
        />
        <Button
          type="button"
          size="sm"
          onClick={insertImage}
          disabled={!isAllowedImageSrc(imageSrc) || !imageAlt.trim()}
        >
          {labels.imageApply}
        </Button>
      </PopoverContent>
    </Popover>
  );
}
