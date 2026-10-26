import { z } from 'zod';

import { defineBlock } from '../define-block.util';
import { localizedText, routeHref } from '../localized.schema';

const ctaSchema = z.object({
  label: localizedText({ max: 48, label: 'admin.blocks.hero.ctaLabel' }),
  href: routeHref(),
});

export const heroPropsSchema = z.object({
  primaryCta: ctaSchema,
  secondaryCta: ctaSchema.optional(),
  showDiagram: z.boolean().meta({ widget: 'toggle', label: 'admin.blocks.hero.showDiagram' }),
  showAvailability: z
    .boolean()
    .meta({ widget: 'toggle', label: 'admin.blocks.hero.showAvailability' }),
});

export const heroBlock = defineBlock({
  type: 'hero',
  version: 1,
  props: heroPropsSchema,
  defaults: {
    primaryCta: { label: { en: 'View case studies', vi: '' }, href: '/projects' },
    showDiagram: true,
    showAvailability: true,
  },
  pages: ['home'],
  layouts: ['SPLIT_7_5', 'ONE'],
  maxPerPage: 1,
  role: 'h1',
  migrate: (props, fromVersion) => {
    if (fromVersion < 1 && props && typeof props === 'object' && 'cta' in props) {
      const { cta, ...rest } = props as { cta: unknown };
      return { ...rest, primaryCta: cta };
    }
    return props;
  },
});
