'use client';

import { cn } from '@portfolio/ui/lib/utils';
import { Eye, EyeOff } from 'lucide-react';
import type { ComponentProps } from 'react';
import { useState } from 'react';

import { Input } from './input';

type PasswordInputProps = Omit<ComponentProps<'input'>, 'type'> & {
  showLabel?: string;
  hideLabel?: string;
};

export function PasswordInput({
  className,
  showLabel = 'Show password',
  hideLabel = 'Hide password',
  ...props
}: PasswordInputProps) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="relative w-full">
      <Input
        type={visible ? 'text' : 'password'}
        data-slot="password-input"
        className={cn('pr-11', className)}
        {...props}
      />
      <button
        type="button"
        data-slot="password-input-toggle"
        className="text-muted-foreground hover:text-accent-foreground absolute top-1/2 right-0 flex size-11 -translate-y-1/2 items-center justify-center rounded-[10px]"
        aria-label={visible ? hideLabel : showLabel}
        aria-pressed={visible}
        onClick={() => setVisible((value) => !value)}
      >
        {visible ? (
          <EyeOff aria-hidden className="h-3.5 w-3.5" />
        ) : (
          <Eye aria-hidden className="h-3.5 w-3.5" />
        )}
      </button>
    </div>
  );
}
