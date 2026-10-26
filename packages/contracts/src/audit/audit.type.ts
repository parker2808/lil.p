import type { z } from 'zod';

import type {
  adminAuditListPageSchema,
  adminAuditListParamsSchema,
  adminAuditLogSchema,
  auditActionSchema,
  auditEntityTypeSchema,
  bulkStatusActionSchema,
  bulkStatusSchema,
} from './audit.schema';

export type AuditAction = z.infer<typeof auditActionSchema>;
export type AuditEntityType = z.infer<typeof auditEntityTypeSchema>;
export type AdminAuditLog = z.infer<typeof adminAuditLogSchema>;
export type AdminAuditListParams = z.infer<typeof adminAuditListParamsSchema>;
export type AdminAuditListPage = z.infer<typeof adminAuditListPageSchema>;
export type BulkStatusAction = z.infer<typeof bulkStatusActionSchema>;
export type BulkStatusInput = z.infer<typeof bulkStatusSchema>;
