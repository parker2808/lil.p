import { z } from 'zod';

export const socialKindSchema = z.enum(['GITHUB', 'LINKEDIN', 'EMAIL', 'RSS', 'OTHER']);

export type SocialKind = z.infer<typeof socialKindSchema>;
