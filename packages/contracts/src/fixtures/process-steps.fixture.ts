import type { PublicProcessStep } from '../process-steps/process-steps.type';

export const processStepFixtures: PublicProcessStep[] = [
  { id: 1, title: 'Audit', caption: 'Tokens, states, routes', iconKey: 'search', lang: 'en' },
  { id: 2, title: 'Tokens', caption: 'Primitives first', iconKey: 'paintbrush', lang: 'en' },
  { id: 3, title: 'Strangler routes', caption: 'Ship one slice', iconKey: 'route', lang: 'en' },
  { id: 4, title: 'Contract tests', caption: 'API over pixels', iconKey: 'file-check', lang: 'en' },
  { id: 5, title: 'Cut over', caption: 'Delete the old tree', iconKey: 'scissors', lang: 'en' },
];
