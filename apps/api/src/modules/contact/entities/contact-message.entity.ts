import type { Prisma } from '../../../generated/prisma/client';

export const contactMessageSelect = {
  id: true,
  name: true,
  email: true,
  topicId: true,
  message: true,
  locale: true,
  status: true,
  createdAt: true,
  updatedAt: true,
  topic: {
    select: {
      id: true,
      slug: true,
      labelEn: true,
      labelVi: true,
    },
  },
} satisfies Prisma.ContactMessageSelect;

export type ContactMessageRow = Prisma.ContactMessageGetPayload<{
  select: typeof contactMessageSelect;
}>;
