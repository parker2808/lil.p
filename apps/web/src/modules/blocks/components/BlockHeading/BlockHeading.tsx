import { Eyebrow } from '@portfolio/ui/components/Eyebrow/Eyebrow';
import { SectionHeader } from '@portfolio/ui/components/SectionHeader/SectionHeader';

import { Link } from '@i18n/navigation';

import type { BlockHeadingProps } from '../../types/entities/block-heading.type';

export function BlockHeading({ heading, id }: { heading?: BlockHeadingProps; id?: string }) {
  if (!heading?.title) {
    return null;
  }

  return (
    <div className="block-heading col-span-full">
      {heading.eyebrow ? <Eyebrow>{heading.eyebrow}</Eyebrow> : null}
      <SectionHeader
        id={id}
        title={heading.title}
        intro={heading.intro}
        iconKey={heading.iconKey}
        action={
          heading.link ? <Link href={heading.link.href}>{heading.link.label}</Link> : undefined
        }
      />
    </div>
  );
}
