import { cn } from '@portfolio/ui/lib/utils';
import { cva, type VariantProps } from 'class-variance-authority';
import type { ComponentProps } from 'react';

export const tableHeadVariants = cva(
  'text-muted-foreground border-border h-10 border-b px-3 font-medium',
  {
    variants: {
      surface: {
        plain: 'text-ui-meta',
        muted: 'bg-muted text-[11px] leading-[1.4] tracking-[0.06em] uppercase',
      },
    },
    defaultVariants: {
      surface: 'plain',
    },
  },
);

export const tableCellVariants = cva('text-ui', {
  variants: {
    density: {
      default: 'px-3',
      comfortable: 'px-3 py-3',
      /** Padding from the parent's `--cell-px` / `--cell-py` density tokens. */
      token: 'px-(--cell-px) py-(--cell-py)',
      flush: 'p-0',
    },
  },
  defaultVariants: {
    density: 'default',
  },
});

export function Table({ className, ...props }: ComponentProps<'table'>) {
  return (
    <table
      data-slot="table"
      className={cn('w-full caption-bottom border-collapse text-left', className)}
      {...props}
    />
  );
}

export function TableHeader({ className, ...props }: ComponentProps<'thead'>) {
  return (
    <thead
      data-slot="table-header"
      className={cn('bg-card sticky top-0 z-10', className)}
      {...props}
    />
  );
}

export function TableBody({ className, ...props }: ComponentProps<'tbody'>) {
  return <tbody data-slot="table-body" className={className} {...props} />;
}

export function TableRow({ className, ...props }: ComponentProps<'tr'>) {
  return (
    <tr
      data-slot="table-row"
      className={cn('border-border data-[selected=true]:bg-sidebar-accent border-b', className)}
      {...props}
    />
  );
}

export function TableHead({
  className,
  surface,
  ...props
}: ComponentProps<'th'> & VariantProps<typeof tableHeadVariants>) {
  return (
    <th
      data-slot="table-head"
      className={cn(tableHeadVariants({ surface }), className)}
      {...props}
    />
  );
}

export function TableCell({
  className,
  density,
  ...props
}: ComponentProps<'td'> & VariantProps<typeof tableCellVariants>) {
  return (
    <td
      data-slot="table-cell"
      className={cn(tableCellVariants({ density }), className)}
      {...props}
    />
  );
}
