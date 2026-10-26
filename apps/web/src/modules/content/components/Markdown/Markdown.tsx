import { getTranslations } from 'next-intl/server';

import { Prose } from '@portfolio/ui/components/Prose/Prose';

import { renderMarkdown } from '../../services/markdown.service';

export async function Markdown({
  source,
  compact = false,
  className,
}: {
  source: string;
  compact?: boolean;
  className?: string;
}) {
  const t = await getTranslations('content');
  const tree = await renderMarkdown(source, {
    copy: t('copy'),
    copied: t('copied'),
    wrap: t('wrap'),
    note: t('note'),
    warning: t('warning'),
    anchor: t('anchor'),
  });

  return (
    <Prose compact={compact} className={className}>
      {tree}
    </Prose>
  );
}
