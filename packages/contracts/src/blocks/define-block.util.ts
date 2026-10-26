import type { z } from 'zod';

import type { LayoutPreset, PageKey } from '../pages/pages.enum';

export type BlockRole = 'h1' | 'required' | 'optional';

export type BlockRef = { kind: string; id: number };

export type BlockDefinition<T extends z.ZodType = z.ZodType> = {
  type: string;
  version: number;
  props: T;
  defaults: z.infer<T>;
  pages: readonly PageKey[];
  layouts: readonly LayoutPreset[];
  maxPerPage?: number;
  role: BlockRole;
  migrate: (props: unknown, fromVersion: number) => unknown;
  refs: (props: z.infer<T>) => BlockRef[];
};

export function defineBlock<T extends z.ZodType>(
  definition: Omit<BlockDefinition<T>, 'migrate' | 'refs'> & {
    migrate?: (props: unknown, fromVersion: number) => unknown;
    refs?: (props: z.infer<T>) => BlockRef[];
  },
): BlockDefinition<T> {
  return {
    ...definition,
    migrate: definition.migrate ?? ((props) => props),
    refs: definition.refs ?? (() => []),
  };
}
