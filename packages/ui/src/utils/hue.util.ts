import type { Hue } from '@portfolio/contracts';

export const HUE_TILE: Record<Hue, string> = {
  JADE: 'bg-hue-jade-subtle text-hue-jade',
  AMBER: 'bg-hue-amber-subtle text-hue-amber',
  BLUE: 'bg-hue-blue-subtle text-hue-blue',
  VIOLET: 'bg-hue-violet-subtle text-hue-violet',
  ROSE: 'bg-hue-rose-subtle text-hue-rose',
};

export const HUE_DOT: Record<Hue, string> = {
  JADE: 'bg-hue-jade',
  AMBER: 'bg-hue-amber',
  BLUE: 'bg-hue-blue',
  VIOLET: 'bg-hue-violet',
  ROSE: 'bg-hue-rose',
};

export const HUE_TOP: Record<Hue, string> = {
  JADE: 'hover:border-t-hue-jade focus-within:border-t-hue-jade',
  AMBER: 'hover:border-t-hue-amber focus-within:border-t-hue-amber',
  BLUE: 'hover:border-t-hue-blue focus-within:border-t-hue-blue',
  VIOLET: 'hover:border-t-hue-violet focus-within:border-t-hue-violet',
  ROSE: 'hover:border-t-hue-rose focus-within:border-t-hue-rose',
};

export const BADGE_HUE = {
  JADE: 'jade',
  AMBER: 'amber',
  BLUE: 'blue',
  VIOLET: 'violet',
  ROSE: 'rose',
} as const satisfies Record<Hue, 'jade' | 'amber' | 'blue' | 'violet' | 'rose'>;
