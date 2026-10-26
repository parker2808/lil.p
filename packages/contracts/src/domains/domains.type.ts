import type { z } from 'zod';

import type {
  adminDomainSchema,
  domainCreateSchema,
  domainUpdateSchema,
  publicDomainSchema,
  publicProjectDomainSchema,
} from './domains.schema';

export type PublicDomain = z.infer<typeof publicDomainSchema>;
export type PublicProjectDomain = z.infer<typeof publicProjectDomainSchema>;
export type DomainCreateInput = z.infer<typeof domainCreateSchema>;
export type DomainUpdateInput = z.infer<typeof domainUpdateSchema>;
export type AdminDomain = z.infer<typeof adminDomainSchema>;
