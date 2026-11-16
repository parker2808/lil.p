import { starterComponentSchemas, type ComponentRegistry } from '@parker2808/cms-core/tree';
import { HOST_TREE_REGISTRY } from '@portfolio/contracts';

export const builderRegistry: ComponentRegistry = {
  ...Object.fromEntries(
    Object.entries(starterComponentSchemas).map(([name, props]) => [name, { props }]),
  ),
  ...HOST_TREE_REGISTRY,
};
