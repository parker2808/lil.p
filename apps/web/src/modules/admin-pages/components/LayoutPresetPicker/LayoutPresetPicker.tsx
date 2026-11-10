'use client';

import { LAYOUT_PRESETS, type LayoutPreset } from '@portfolio/contracts';
import { RadioGroup, RadioGroupItem } from '@portfolio/ui/components/ui/radio-group';

function columns(preset: LayoutPreset) {
  const rule = LAYOUT_PRESETS[preset];
  return Array.from({ length: rule.lg }, (_, index) => index);
}

export function LayoutPresetPicker({
  value,
  options,
  readOnly,
  labels,
  onChange,
}: {
  value: LayoutPreset;
  options: readonly LayoutPreset[];
  readOnly: boolean;
  labels: { layout: string; responsive: string };
  onChange: (layout: LayoutPreset) => void;
}) {
  const rule = LAYOUT_PRESETS[value];
  return (
    <div className="flex flex-col gap-2">
      <RadioGroup
        aria-label={labels.layout}
        value={value}
        disabled={readOnly}
        onValueChange={(next) => {
          onChange(next as LayoutPreset);
        }}
        className="flex flex-wrap gap-1 border-0"
      >
        {options.map((preset) => (
          <RadioGroupItem
            key={preset}
            value={preset}
            aria-label={preset}
            className="h-auto flex-col gap-1 py-2"
          >
            <span className="flex h-6 w-10 gap-0.5">
              {columns(preset).map((index) => (
                <span key={index} className="bg-muted-foreground/40 flex-1 rounded-sm" />
              ))}
            </span>
            <span className="text-ui-meta">{preset}</span>
          </RadioGroupItem>
        ))}
      </RadioGroup>
      <p className="text-ui-meta text-muted-foreground">
        {labels.responsive
          .replace('{sm}', String(rule.sm))
          .replace('{md}', String(rule.md))
          .replace('{lg}', String(rule.lg))}
      </p>
    </div>
  );
}
