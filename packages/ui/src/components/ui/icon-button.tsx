'use client';

import { cn } from '@portfolio/ui/lib/utils';
import type { ComponentProps } from 'react';

import { Button } from './button';
import { Tooltip, TooltipContent, TooltipTrigger } from './tooltip';

export type IconButtonProps = ComponentProps<typeof Button> & {
  /** Accessible name of the action; also rendered as the tooltip text. */
  label: string;
};

export function IconButton({ label, className, ...props }: IconButtonProps) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          className={cn('size-8 shrink-0 p-0', 'pointer-coarse:size-11', className)}
          {...props}
          aria-label={label}
        />
      </TooltipTrigger>
      <TooltipContent>{label}</TooltipContent>
    </Tooltip>
  );
}
