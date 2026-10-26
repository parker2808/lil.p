import type { PublicProjectDetail } from '@portfolio/contracts';
import { Breadcrumb, BreadcrumbItem, BreadcrumbList } from '@portfolio/ui/components/ui/breadcrumb';
import { Badge } from '@portfolio/ui/components/ui/badge';
import { Icon } from '@portfolio/ui/components/Icon/Icon';
import { VersionTag } from '@portfolio/ui/components/VersionTag/VersionTag';
import { BADGE_HUE } from '@portfolio/ui/utils/hue.util';

import { Link } from '@i18n/navigation';

export function CaseStudyHeader({
  project,
  labels,
}: {
  project: PublicProjectDetail;
  labels: { back: string; nda: string; version: string };
}) {
  return (
    <div className="flex flex-col gap-6">
      <Breadcrumb aria-label={labels.back}>
        <BreadcrumbList>
          <BreadcrumbItem>
            <Link href="/projects" className="hover:text-foreground">
              {labels.back}
            </Link>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <div className="flex flex-wrap items-center gap-2">
        {project.domain ? (
          <Badge hue={BADGE_HUE[project.domain.hue]} className="normal-case">
            <Icon name={project.domain.iconKey} className="size-3" />
            {project.domain.name}
          </Badge>
        ) : null}
        {project.isConfidential ? <Badge variant="warning">{labels.nda}</Badge> : null}
        {project.versionFrom && project.versionTo ? (
          <VersionTag
            from={project.versionFrom}
            to={project.versionTo}
            arrowLabel={labels.version}
          />
        ) : null}
      </div>
      <div className="flex flex-col gap-3">
        <h1 className="font-heading text-title font-semibold">{project.title}</h1>
        <p className="text-prose text-muted-foreground max-w-measure">{project.tagline}</p>
      </div>
    </div>
  );
}
