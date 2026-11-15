import { starterComponentSchemas, type ComponentRegistry } from '@parker2808/cms-core/tree';
import { BLOCK_REGISTRY } from '@portfolio/contracts';

export const builderRegistry: ComponentRegistry = {
  ...Object.fromEntries(
    Object.entries(starterComponentSchemas).map(([name, props]) => [name, { props }]),
  ),
  ...Object.fromEntries(
    Object.values(BLOCK_REGISTRY).map(({ type, props, role }) => [type, { props, role }]),
  ),
};
