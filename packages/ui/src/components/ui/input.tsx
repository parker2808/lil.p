import { cn } from '@portfolio/ui/lib/utils';
import type { ComponentProps } from 'react';

/** Field chrome shared by `Input` and native `<select>` controls. */
export const inputClassName = [
  'border-input bg-background text-ui flex h-8 w-full rounded-md border px-3',
  'placeholder:text-muted-foreground',
  'disabled:cursor-not-allowed disabled:opacity-50',
  'aria-invalid:border-destructive',
].join(' ');

export function Input({ className, type = 'text', ...props }: ComponentProps<'input'>) {
  return (
    <input type={type} data-slot="input" className={cn(inputClassName, className)} {...props} />
  );
}
