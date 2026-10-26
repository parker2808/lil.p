import { z } from 'zod';

import { PUBLIC_ROUTES } from '../constants/routes.constant';

/** `{ en, vi }` pair. English is required; Vietnamese may be empty. */
export function localizedText(opts?: { max?: number; label?: string }) {
  const max = opts?.max ?? 240;
  return z.object({
    en: z
      .string()
      .min(1)
      .max(max)
      .meta({ widget: 'text', label: opts?.label ?? 'admin.blocks.field.en' }),
    vi: z
      .string()
      .max(max)
      .optional()
      .default('')
      .meta({ widget: 'text', label: 'admin.blocks.field.vi' }),
  });
}

export function localizedMarkdown(opts?: { label?: string }) {
  return z.object({
    en: z
      .string()
      .min(1)
      .meta({ widget: 'markdown', label: opts?.label ?? 'admin.blocks.field.en' }),
    vi: z
      .string()
      .optional()
      .default('')
      .meta({ widget: 'markdown', label: 'admin.blocks.field.vi' }),
  });
}

export function routeHref() {
  return z.enum(PUBLIC_ROUTES).meta({ widget: 'route', label: 'admin.blocks.field.href' });
}

export const sectionHeadingSchema = z.object({
  eyebrow: localizedText({ max: 48, label: 'admin.blocks.heading.eyebrow' }).optional(),
  title: localizedText({ max: 120, label: 'admin.blocks.heading.title' }),
  intro: localizedText({ max: 400, label: 'admin.blocks.heading.intro' }).optional(),
  iconKey: z.string().optional().meta({ widget: 'icon', label: 'admin.blocks.heading.iconKey' }),
  link: z
    .object({
      label: localizedText({ max: 48, label: 'admin.blocks.heading.linkLabel' }),
      href: routeHref(),
    })
    .optional(),
});
