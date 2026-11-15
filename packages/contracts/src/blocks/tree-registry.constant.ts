import type { ComponentRegistry } from '@parker2808/cms-core/tree';

import { BLOCK_REGISTRY } from './block-registry.constant';

export const HOST_TREE_REGISTRY: ComponentRegistry = Object.fromEntries(
  Object.values(BLOCK_REGISTRY).map((definition) => [
    definition.type,
    {
      props: definition.props,
      role: definition.role === 'h1' ? 'h1' : 'optional',
    },
  ]),
);
