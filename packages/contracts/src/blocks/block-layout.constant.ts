import type { BlockSurface, LayoutPreset } from '../pages/pages.enum';

/** Columns per breakpoint (spec §4). `sm` < 768, `md` 768–1023, `lg` ≥ 1024. */
export const LAYOUT_PRESETS: Record<
  LayoutPreset,
  { sm: number; md: number; lg: number; split?: string }
> = {
  ONE: { sm: 1, md: 1, lg: 1 },
  TWO: { sm: 1, md: 2, lg: 2 },
  THREE: { sm: 1, md: 2, lg: 3 },
  FOUR: { sm: 1, md: 2, lg: 4 },
  SPLIT_8_4: { sm: 1, md: 1, lg: 2, split: '8+4' },
  SPLIT_4_8: { sm: 1, md: 1, lg: 2, split: '4+8' },
  SPLIT_7_5: { sm: 1, md: 1, lg: 2, split: '7+5' },
};

export const BLOCK_SURFACES: readonly BlockSurface[] = ['PLAIN', 'BAND'];
