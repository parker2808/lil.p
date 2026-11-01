'use client';

import type { Hue, IconKey } from '@portfolio/contracts';
import { DataTable, type DataTableLabels } from '@portfolio/ui/components/DataTable/DataTable';
import { HuePicker } from '@portfolio/ui/components/HuePicker/HuePicker';
import { IconPicker } from '@portfolio/ui/components/IconPicker/IconPicker';
import { Button } from '@portfolio/ui/components/ui/button';
import { ConfirmDialog } from '@portfolio/ui/components/ui/confirm-dialog';
import { Field, FieldError, FieldLabel } from '@portfolio/ui/components/ui/field';
import { IconButton } from '@portfolio/ui/components/ui/icon-button';
import { Input } from '@portfolio/ui/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@portfolio/ui/components/ui/select';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetTitle,
} from '@portfolio/ui/components/ui/sheet';
import { Switch } from '@portfolio/ui/components/ui/switch';
import { Textarea } from '@portfolio/ui/components/ui/textarea';
import { TooltipProvider } from '@portfolio/ui/components/ui/tooltip';
import { type ColumnDef } from '@tanstack/react-table';
import { useForm } from '@tanstack/react-form';
import { ArrowDown, ArrowUp, Pencil, Trash2 } from 'lucide-react';
import { useMemo, useState } from 'react';
import type { ZodType } from 'zod';

export type SmallField = {
  name: string;
  label: string;
  kind: 'text' | 'textarea' | 'switch' | 'icon' | 'hue' | 'select';
  options?: { value: string; label: string }[];
  numeric?: boolean;
};

export type SmallEntityRow = {
  id: number;
  sortOrder?: number;
  isVisible?: boolean;
};

export function SmallEntityIndex<T extends SmallEntityRow>({
  title,
  items,
  isError,
  isLoading,
  isFetching,
  canWrite,
  fields,
  defaults,
  schema,
  columns,
  titleOf,
  hasReorder,
  hasVisible,
  labels,
  pickerLabels,
  onCreate,
  onUpdate,
  onDelete,
  onMove,
  onToggleVisible,
  onRetry,
}: {
  title: string;
  items: T[];
  isError?: boolean;
  isLoading?: boolean;
  isFetching?: boolean;
  canWrite: boolean;
  fields: SmallField[];
  defaults: Record<string, unknown>;
  schema: ZodType<Record<string, unknown>>;
  columns: ColumnDef<T>[];
  titleOf: (row: T) => string;
  hasReorder: boolean;
  hasVisible: boolean;
  labels: DataTableLabels & {
    new: string;
    save: string;
    editTitle: string;
    createTitle: string;
    search: string;
    visible: string;
  };
  pickerLabels: {
    icon: { open: string; search: string; empty: string };
    hues: Record<Hue, string>;
  };
  onCreate: (body: Record<string, unknown>) => Promise<unknown>;
  onUpdate: (id: number, body: Record<string, unknown>) => Promise<unknown>;
  onDelete: (id: number) => void;
  onMove?: (id: number, direction: -1 | 1) => void;
  onToggleVisible?: (row: T) => void;
  onRetry: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<T | null>(null);
  const [pendingDelete, setPendingDelete] = useState<T | null>(null);
  const [q, setQ] = useState('');
  const filtered = items.filter((item) =>
    titleOf(item).toLowerCase().includes(q.trim().toLowerCase()),
  );

  const tableColumns = useMemo<ColumnDef<T>[]>(() => {
    const extra: ColumnDef<T>[] = [];
    if (hasVisible && onToggleVisible) {
      extra.push({
        id: 'isVisible',
        header: labels.visible,
        enableSorting: false,
        cell: ({ row }) => (
          <Switch
            checked={Boolean(row.original.isVisible)}
            disabled={!canWrite}
            onCheckedChange={() => onToggleVisible(row.original)}
            aria-label={labels.visible}
          />
        ),
      });
    }
    extra.push({
      id: 'actions',
      header: labels.shortcuts.edit,
      enableSorting: false,
      enableHiding: false,
      cell: ({ row }) =>
        canWrite ? (
          <TooltipProvider>
            <div className="flex gap-1">
              <IconButton
                type="button"
                variant="ghost"
                label={`${labels.shortcuts.edit}: ${titleOf(row.original)}`}
                onClick={() => {
                  setEditing(row.original);
                  setOpen(true);
                }}
              >
                <Pencil aria-hidden className="size-4" />
              </IconButton>
              {hasReorder && onMove ? (
                <>
                  <IconButton
                    type="button"
                    variant="ghost"
                    label={`${labels.previous}: ${titleOf(row.original)}`}
                    onClick={() => onMove(row.original.id, -1)}
                  >
                    <ArrowUp aria-hidden className="size-4" />
                  </IconButton>
                  <IconButton
                    type="button"
                    variant="ghost"
                    label={`${labels.next}: ${titleOf(row.original)}`}
                    onClick={() => onMove(row.original.id, 1)}
                  >
                    <ArrowDown aria-hidden className="size-4" />
                  </IconButton>
                </>
              ) : null}
              <IconButton
                type="button"
                variant="ghost"
                label={`${labels.bulkDelete}: ${titleOf(row.original)}`}
                onClick={() => setPendingDelete(row.original)}
              >
                <Trash2 aria-hidden className="size-4" />
              </IconButton>
            </div>
          </TooltipProvider>
        ) : null,
    });
    return [...columns, ...extra];
  }, [canWrite, columns, hasReorder, hasVisible, labels, onMove, onToggleVisible]);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-ui-title font-semibold">{title}</h1>
        {canWrite ? (
          <Button
            type="button"
            size="sm"
            onClick={() => {
              setEditing(null);
              setOpen(true);
            }}
          >
            {labels.new}
          </Button>
        ) : null}
      </div>
      <Input
        value={q}
        onChange={(event) => setQ(event.target.value)}
        placeholder={labels.search}
        aria-label={labels.search}
        className="w-56"
      />
      <DataTable
        columns={tableColumns}
        data={filtered}
        rowId={(row) => String(row.id)}
        total={filtered.length}
        page={1}
        pageSize={Math.max(filtered.length, 1)}
        hasFilters={Boolean(q)}
        isError={isError}
        isLoading={isLoading}
        isFetching={isFetching}
        canWrite={canWrite}
        labels={labels}
        onOpen={(row) => {
          setEditing(row);
          setOpen(true);
        }}
        onEdit={(row) => {
          setEditing(row);
          setOpen(true);
        }}
        onDelete={(row) => onDelete(row.id)}
        onBulkDelete={(rows) => {
          for (const row of rows) {
            onDelete(row.id);
          }
        }}
        onCreate={() => {
          setEditing(null);
          setOpen(true);
        }}
        onClearFilters={() => setQ('')}
        onRetry={onRetry}
        renderCard={(row) => (
          <button
            type="button"
            className="bg-card w-full rounded-lg border p-3 text-left"
            onClick={() => {
              setEditing(row);
              setOpen(true);
            }}
          >
            <p className="text-ui font-medium">{titleOf(row)}</p>
          </button>
        )}
      />
      <ConfirmDialog
        open={pendingDelete !== null}
        onOpenChange={(open) => !open && setPendingDelete(null)}
        title={labels.confirmDeleteTitle}
        description={labels.confirmDelete}
        cancelLabel={labels.cancel}
        confirmLabel={labels.bulkDelete}
        onConfirm={() => {
          if (pendingDelete) onDelete(pendingDelete.id);
          setPendingDelete(null);
        }}
      />
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent>
          <SheetTitle>{editing ? labels.editTitle : labels.createTitle}</SheetTitle>
          <SheetDescription>{title}</SheetDescription>
          <EntityForm
            key={editing?.id ?? 'new'}
            fields={fields}
            defaults={editing ? { ...defaults, ...pickFields(editing, fields) } : defaults}
            schema={schema}
            labels={labels}
            pickerLabels={pickerLabels}
            onSubmit={async (body) => {
              if (editing) {
                await onUpdate(editing.id, body);
              } else {
                await onCreate(body);
              }
              setOpen(false);
            }}
          />
        </SheetContent>
      </Sheet>
    </div>
  );
}

function pickFields(row: object, fields: SmallField[]): Record<string, unknown> {
  const next: Record<string, unknown> = {};
  for (const field of fields) {
    next[field.name] = (row as Record<string, unknown>)[field.name];
  }
  return next;
}

function EntityForm({
  fields,
  defaults,
  schema,
  labels,
  pickerLabels,
  onSubmit,
}: {
  fields: SmallField[];
  defaults: Record<string, unknown>;
  schema: ZodType<Record<string, unknown>>;
  labels: { save: string };
  pickerLabels: {
    icon: { open: string; search: string; empty: string };
    hues: Record<Hue, string>;
  };
  onSubmit: (body: Record<string, unknown>) => Promise<void>;
}) {
  const form = useForm({
    defaultValues: defaults,
    validators: { onSubmit: schema as never },
    onSubmit: async ({ value }) => {
      await onSubmit(value);
    },
  });

  return (
    <form
      className="mt-4 flex flex-1 flex-col gap-3 overflow-y-auto"
      onSubmit={(event) => {
        event.preventDefault();
        void form.handleSubmit();
      }}
    >
      {fields.map((field) => (
        <form.Field key={field.name} name={field.name}>
          {(api) => (
            <Field>
              <FieldLabel htmlFor={field.name}>{field.label}</FieldLabel>
              {field.kind === 'text' ? (
                <Input
                  id={field.name}
                  value={String(api.state.value ?? '')}
                  onBlur={api.handleBlur}
                  onChange={(event) => api.handleChange(event.target.value)}
                />
              ) : null}
              {field.kind === 'textarea' ? (
                <Textarea
                  id={field.name}
                  value={String(api.state.value ?? '')}
                  onBlur={api.handleBlur}
                  onChange={(event) => api.handleChange(event.target.value)}
                />
              ) : null}
              {field.kind === 'switch' ? (
                <Switch
                  id={field.name}
                  checked={Boolean(api.state.value)}
                  onCheckedChange={(checked) => api.handleChange(checked)}
                />
              ) : null}
              {field.kind === 'icon' ? (
                <IconPicker
                  value={(api.state.value as IconKey | '') ?? ''}
                  onChange={(value) => api.handleChange(value)}
                  labels={pickerLabels.icon}
                />
              ) : null}
              {field.kind === 'hue' ? (
                <HuePicker
                  value={(api.state.value as Hue | '') ?? ''}
                  onChange={(value) => api.handleChange(value)}
                  labels={pickerLabels.hues}
                />
              ) : null}
              {field.kind === 'select' ? (
                <Select
                  value={String(api.state.value ?? '')}
                  onValueChange={(value) => api.handleChange(field.numeric ? Number(value) : value)}
                >
                  <SelectTrigger id={field.name}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {(field.options ?? []).map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : null}
              <FieldError>
                {api.state.meta.errors[0] ? String(api.state.meta.errors[0]) : null}
              </FieldError>
            </Field>
          )}
        </form.Field>
      ))}
      <Button type="submit" size="sm" className="mt-auto">
        {labels.save}
      </Button>
    </form>
  );
}
