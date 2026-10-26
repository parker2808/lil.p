import { z } from 'zod';

export const AUDIT_ACTIONS = [
  'CREATE',
  'UPDATE',
  'PUBLISH',
  'ARCHIVE',
  'RESTORE',
  'LOGIN',
] as const;

export const AUDIT_ENTITY_TYPES = [
  'project',
  'post',
  'page',
  'user',
  'media',
  'skill',
  'skill-category',
  'domain',
  'tag',
  'experience',
  'education',
  'principle',
  'process-step',
  'profile-stat',
  'site-settings',
  'profile',
  'nav-item',
  'social-link',
  'contact-topic',
  'contact-message',
] as const;

export const auditActionSchema = z.enum(AUDIT_ACTIONS);
export const auditEntityTypeSchema = z.enum(AUDIT_ENTITY_TYPES);

export const adminAuditLogSchema = z.object({
  id: z.number().int(),
  userId: z.number().int().nullable(),
  userName: z.string().nullable(),
  action: auditActionSchema,
  entityType: z.string(),
  entityId: z.string(),
  summary: z.string(),
  createdAt: z.string(),
});

export const adminAuditListParamsSchema = z.object({
  cursor: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().min(1).max(100).default(50),
  entityType: z.string().max(64).optional(),
  userId: z.coerce.number().int().positive().optional(),
});

export const adminAuditListPageSchema = z.object({
  items: z.array(adminAuditLogSchema),
  nextCursor: z.number().int().nullable(),
});

export const bulkStatusActionSchema = z.enum(['publish', 'unpublish', 'archive']);

export const bulkStatusSchema = z.object({
  ids: z.array(z.number().int().positive()).min(1).max(100),
  action: bulkStatusActionSchema,
});
