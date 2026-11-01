'use client';

import { cn } from '@portfolio/ui/lib/utils';
import type { ChangeEvent, ComponentProps, ReactElement, ReactNode } from 'react';
import { cloneElement, useId, useState } from 'react';

import { Field, FieldError, FieldLabel } from './field';

type ControlProps = Pick<
  ComponentProps<'input'>,
  | 'id'
  | 'required'
  | 'maxLength'
  | 'value'
  | 'defaultValue'
  | 'onChange'
  | 'aria-describedby'
  | 'aria-invalid'
>;

type FormFieldProps = Omit<ComponentProps<'div'>, 'children'> & {
  label: ReactNode;
  children: ReactElement<ControlProps>;
  required?: boolean;
  error?: ReactNode;
  maxLength?: number;
};

export function FormField({
  label,
  children,
  required = false,
  error,
  maxLength,
  className,
  ...props
}: FormFieldProps) {
  const generatedId = useId();
  const controlId = children.props.id ?? generatedId;
  const errorId = `${controlId}-error`;
  const limit = maxLength ?? children.props.maxLength;
  const [currentValue, setCurrentValue] = useState(String(children.props.defaultValue ?? ''));
  const value = children.props.value === undefined ? currentValue : String(children.props.value);
  const counter = `${value.length} / ${limit}`;
  const requiredMark = '*';
  const describedBy = [children.props['aria-describedby'], error ? errorId : undefined]
    .filter(Boolean)
    .join(' ');

  const control = cloneElement(children, {
    id: controlId,
    required: required || children.props.required,
    maxLength: limit,
    'aria-invalid': error ? true : children.props['aria-invalid'],
    'aria-describedby': describedBy || undefined,
    onChange: (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setCurrentValue(event.target.value);
      children.props.onChange?.(event as ChangeEvent<HTMLInputElement>);
    },
  });

  return (
    <Field className={cn(className)} {...props}>
      <FieldLabel htmlFor={controlId}>
        {label}
        {(required || children.props.required) && (
          <span aria-hidden="true" className="text-destructive ml-1">
            {requiredMark}
          </span>
        )}
      </FieldLabel>
      {control}
      {(error || limit !== undefined) && (
        <div className="flex items-start justify-between gap-2">
          <FieldError id={errorId}>{error}</FieldError>
          {limit !== undefined && (
            <span data-slot="field-counter" className="text-ui-meta text-muted-foreground ml-auto">
              {counter}
            </span>
          )}
        </div>
      )}
    </Field>
  );
}
