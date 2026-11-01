import type { PublicBlock } from '@portfolio/contracts';
import { CtaBand } from '@portfolio/ui/components/CtaBand/CtaBand';
import { Button } from '@portfolio/ui/components/ui/button';
import { Skeleton } from '@portfolio/ui/components/ui/skeleton';

import { CopyEmailButton } from '@/modules/core/components/CopyEmailButton/CopyEmailButton';
import { getSite } from '@/modules/core/services/site.service';

import type { BlockContext } from '../../types/entities/block-context.type';

export async function CtaBandBlock({
  block,
  context,
}: {
  block: PublicBlock;
  context: BlockContext;
}) {
  const props = block.props as {
    title?: string;
    intro?: string;
    showEmail?: boolean;
    showSocial?: boolean;
  };
  if (!props.title) {
    return null;
  }

  const site = await getSite(context.locale);
  const social = site.socialLinks.filter((link) => link.showInCta).slice(0, 2);

  return (
    <div className="col-span-full" lang={block.lang}>
      <CtaBand
        title={props.title}
        intro={props.intro}
        actions={
          <>
            {props.showEmail ? <CopyEmailButton email={site.settings.contactEmail} /> : null}
            {props.showSocial
              ? social.map((link) => (
                  <Button surface="public" key={link.id} asChild variant="outline">
                    <a href={link.url} rel="noreferrer">
                      {link.label}
                    </a>
                  </Button>
                ))
              : null}
          </>
        }
      />
    </div>
  );
}

export function CtaBandSkeleton() {
  return <Skeleton className="h-48 w-full" />;
}
