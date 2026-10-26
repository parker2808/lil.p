import { z } from 'zod';

export const skillDepthSchema = z.enum(['DAILY', 'SHIPPED', 'GROWING']);

export type SkillDepth = z.infer<typeof skillDepthSchema>;
