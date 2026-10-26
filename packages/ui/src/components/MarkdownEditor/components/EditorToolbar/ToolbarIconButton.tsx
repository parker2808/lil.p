'use client';

import { Button } from '@portfolio/ui/components/ui/button';
import { Kbd } from '@portfolio/ui/components/ui/kbd';
import { Tooltip, TooltipContent, TooltipTrigger } from '@portfolio/ui/components/ui/tooltip';
import { cn } from '@portfolio/ui/lib/utils';
import type { ComponentProps } from 'react';

export function ToolbarIconButton({
  label,
  shortcut,
  pressed,
  className,
  ...props
}: ComponentProps<typeof Button> & {
  label: string;
  shortcut?: string;
  pressed?: boolean;
}) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          aria-label={label}
          aria-pressed={pressed}
          className={cn('size-7 p-0', pressed && 'bg-accent text-accent-foreground', className)}
          {...props}
        />
      </TooltipTrigger>
      <TooltipContent className="flex items-center gap-2">
        <span>{label}</span>
        {shortcut ? <Kbd>{shortcut}</Kbd> : null}
      </TooltipContent>
    </Tooltip>
  );
}
