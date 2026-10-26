import type { z } from 'zod';

import type { publicDomainSchema, publicProjectDomainSchema } from './domains.schema';

export type PublicDomain = z.infer<typeof publicDomainSchema>;
export type PublicProjectDomain = z.infer<typeof publicProjectDomainSchema>;
