import { z } from 'zod';

import { defineBlock } from '../define-block.util';
import { localizedText } from '../localized.schema';

export const contactFormPropsSchema = z.object({
  eyebrow: localizedText({ max: 48, label: 'admin.blocks.contactForm.eyebrow' }),
  title: localizedText({ max: 120, label: 'admin.blocks.contactForm.title' }),
  intro: localizedText({ max: 400, label: 'admin.blocks.contactForm.intro' }).optional(),
});

export const contactFormBlock = defineBlock({
  type: 'contact-form',
  version: 1,
  props: contactFormPropsSchema,
  defaults: {
    eyebrow: { en: 'Contact', vi: '' },
    title: { en: "Let's talk about your product.", vi: '' },
  },
  pages: ['contact'],
  layouts: ['TWO', 'ONE'],
  maxPerPage: 1,
  role: 'h1',
});
