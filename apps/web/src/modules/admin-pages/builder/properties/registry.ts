import { starterComponentSchemas, type ComponentRegistry } from '@parker2808/cms-core/tree';

export const builderRegistry: ComponentRegistry = Object.fromEntries(
  Object.entries(starterComponentSchemas).map(([name, props]) => [name, { props }]),
);
