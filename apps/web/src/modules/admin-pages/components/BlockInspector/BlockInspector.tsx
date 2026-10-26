'use client';

import {
  BLOCK_REGISTRY,
  type AdminBlock,
  type BlockSurface,
  type BlockType,
  type BlockUpdateInput,
} from '@portfolio/contracts';
import { Input } from '@portfolio/ui/components/ui/input';
import { Field, FieldError, FieldLabel } from '@portfolio/ui/components/ui/field';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@portfolio/ui/components/ui/tabs';
import { ToggleGroup, ToggleGroupItem } from '@portfolio/ui/components/ui/toggle-group';
import { useTranslations } from 'next-intl';
import { useState } from 'react';

import { SchemaForm } from '@/modules/admin-core/components/SchemaForm/SchemaForm';
import { mapFieldErrors } from '@/modules/admin-core/utils/map-field-errors.util';
import { ApiError } from '@/modules/core/utils/api-error.util';

import { LayoutPresetPicker } from '../LayoutPresetPicker/LayoutPresetPicker';

export function BlockInspector({
  block,
  readOnly,
  fieldErrors,
  onUpdate,
  onPropsChange,
}: {
  block: AdminBlock;
  readOnly: boolean;
  fieldErrors?: Record<string, string>;
  onUpdate: (body: BlockUpdateInput) => Promise<unknown>;
  onPropsChange: (props: Record<string, unknown>) => void;
}) {
  const t = useTranslations('admin.pages');
  const definition = BLOCK_REGISTRY[block.type as BlockType];
  const [keyValue, setKeyValue] = useState(block.key);

  if (!definition) {
    return <p className="text-destructive">{t('unknown')}</p>;
  }

  return (
    <Tabs defaultValue="props">
      <TabsList>
        <TabsTrigger value="props">{t('tabs.props')}</TabsTrigger>
        <TabsTrigger value="layout">{t('tabs.layout')}</TabsTrigger>
        <TabsTrigger value="appearance">{t('tabs.appearance')}</TabsTrigger>
        <TabsTrigger value="anchor">{t('tabs.anchor')}</TabsTrigger>
      </TabsList>
      <TabsContent value="props" className="pt-3">
        <SchemaForm
          key={block.id}
          schema={definition.props}
          defaultValues={block.props as Record<string, unknown>}
          fieldErrors={fieldErrors}
          readOnly={readOnly}
          onValuesChange={onPropsChange}
        />
      </TabsContent>
      <TabsContent value="layout" className="pt-3">
        <LayoutPresetPicker
          value={block.layout}
          options={definition.layouts}
          readOnly={readOnly}
          labels={{
            layout: t('layout'),
            responsive: t('responsive', { sm: '{sm}', md: '{md}', lg: '{lg}' }),
          }}
          onChange={(layout) => {
            void onUpdate({ layout, updatedAt: block.updatedAt });
          }}
        />
      </TabsContent>
      <TabsContent value="appearance" className="pt-3">
        <div className="flex flex-col gap-2">
          <p className="text-ui">{t('surface')}</p>
          <ToggleGroup
            type="single"
            value={block.surface}
            disabled={readOnly}
            onValueChange={(next) => {
              if (next) {
                void onUpdate({ surface: next as BlockSurface, updatedAt: block.updatedAt });
              }
            }}
          >
            <ToggleGroupItem value="PLAIN">{t('plain')}</ToggleGroupItem>
            <ToggleGroupItem value="BAND">{t('band')}</ToggleGroupItem>
          </ToggleGroup>
          <p className="text-ui-meta text-muted-foreground">{t('bandNote')}</p>
        </div>
      </TabsContent>
      <TabsContent value="anchor" className="pt-3">
        <Field>
          <FieldLabel htmlFor="block-key">{t('anchor')}</FieldLabel>
          <Input
            id="block-key"
            value={keyValue}
            disabled={readOnly}
            onChange={(event) => setKeyValue(event.target.value)}
            onBlur={() => {
              if (keyValue !== block.key) {
                void onUpdate({ key: keyValue, updatedAt: block.updatedAt });
              }
            }}
          />
          <p className="text-ui-meta text-muted-foreground">{t('publicUrl', { key: block.key })}</p>
          <FieldError>{fieldErrors?.key}</FieldError>
        </Field>
      </TabsContent>
    </Tabs>
  );
}

export function inspectorFieldErrors(error: unknown): Record<string, string> {
  if (error instanceof ApiError) {
    return mapFieldErrors(error);
  }
  return {};
}
