'use client';

import type { Hue } from '@portfolio/contracts';
import { Badge } from '@portfolio/ui/components/ui/badge';
import { RadioGroup, RadioGroupItem } from '@portfolio/ui/components/ui/radio-group';
import { BADGE_HUE } from '@portfolio/ui/utils/hue.util';

const HUES = ['JADE', 'AMBER', 'BLUE', 'VIOLET', 'ROSE'] as const satisfies readonly Hue[];

export function HuePicker({
  value,
  onChange,
  labels,
  groupLabel,
}: {
  value: Hue | '';
  onChange: (value: Hue) => void;
  labels: Record<Hue, string>;
  groupLabel: string;
}) {
  return (
    <RadioGroup
      aria-label={groupLabel}
      value={value}
      onValueChange={(next) => {
        onChange(next as Hue);
      }}
      className="flex flex-wrap gap-1 border-0"
    >
      {HUES.map((hue) => (
        <RadioGroupItem key={hue} value={hue} aria-label={labels[hue]} className="border-0 px-1">
          <Badge hue={BADGE_HUE[hue]} className="normal-case">
            {labels[hue]}
          </Badge>
        </RadioGroupItem>
      ))}
    </RadioGroup>
  );
}

export const HUE_OPTIONS = HUES;
