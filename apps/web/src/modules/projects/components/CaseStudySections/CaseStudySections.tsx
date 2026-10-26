import type { PublicProjectDetail } from '@portfolio/contracts';
import { DecisionCard } from '@portfolio/ui/components/DecisionCard/DecisionCard';
import { RequirementColumns } from '@portfolio/ui/components/RequirementColumns/RequirementColumns';

import { Markdown } from '@/modules/content/components/Markdown/Markdown';

import { splitDecisions, splitLimitsAndScope } from '../../utils/case-study.util';

type SectionSpec = {
  id: string;
  eyebrow: string;
  body?: string;
  scope?: { title: string; items: string[] }[];
  decisions?: { title: string; body: string }[];
};

export function caseStudyToc(
  project: PublicProjectDetail,
  labels: {
    summary: string;
    limits: string;
    scope: string;
    how: string;
    tradeoffs: string;
    result: string;
    retro: string;
  },
): { id: string; title: string; depth: 2 | 3 }[] {
  const { limits, scope } = splitLimitsAndScope(project.constraints);
  const decisions = splitDecisions(project.decisions);
  const items: { id: string; title: string; depth: 2 | 3 }[] = [];
  if (project.problem) {
    items.push({ id: 'summary', title: labels.summary, depth: 2 });
  }
  if (limits) {
    items.push({ id: 'limits', title: labels.limits, depth: 2 });
  }
  if (scope.length) {
    items.push({ id: 'scope', title: labels.scope, depth: 2 });
  }
  if (project.approach) {
    items.push({ id: 'how', title: labels.how, depth: 2 });
  }
  if (decisions.length) {
    items.push({ id: 'tradeoffs', title: labels.tradeoffs, depth: 2 });
  }
  if (project.outcome) {
    items.push({ id: 'result', title: labels.result, depth: 2 });
  }
  if (project.lessons) {
    items.push({ id: 'retro', title: labels.retro, depth: 2 });
  }
  return items;
}

export async function CaseStudySections({
  project,
  labels,
}: {
  project: PublicProjectDetail;
  labels: {
    summary: string;
    limits: string;
    scope: string;
    how: string;
    tradeoffs: string;
    result: string;
    retro: string;
  };
}) {
  const { limits, scope } = splitLimitsAndScope(project.constraints);
  const decisions = splitDecisions(project.decisions);
  const sections: SectionSpec[] = [
    { id: 'summary', eyebrow: labels.summary, body: project.problem },
    { id: 'limits', eyebrow: labels.limits, body: limits },
    { id: 'scope', eyebrow: labels.scope, scope },
    { id: 'how', eyebrow: labels.how, body: project.approach },
    { id: 'tradeoffs', eyebrow: labels.tradeoffs, decisions },
    { id: 'result', eyebrow: labels.result, body: project.outcome },
    { id: 'retro', eyebrow: labels.retro, body: project.lessons },
  ];

  return (
    <div className="flex flex-col gap-12">
      {sections.map((section) => {
        const hasBody = Boolean(section.body);
        const hasScope = Boolean(section.scope?.length);
        const hasDecisions = Boolean(section.decisions?.length);
        if (!hasBody && !hasScope && !hasDecisions) {
          return null;
        }
        return (
          <section key={section.id} className="flex flex-col gap-3">
            <p className="text-eyebrow text-subtle-foreground font-mono uppercase">
              {section.eyebrow}
            </p>
            <h2 id={section.id} className="sr-only">
              {section.eyebrow}
            </h2>
            {hasBody ? <Markdown source={section.body!} /> : null}
            {hasScope ? <RequirementColumns columns={section.scope!} /> : null}
            {hasDecisions
              ? section.decisions!.map((card) =>
                  card.title ? (
                    <DecisionCard key={card.title} title={card.title}>
                      <Markdown source={card.body} compact />
                    </DecisionCard>
                  ) : (
                    <Markdown key="untitled" source={card.body} />
                  ),
                )
              : null}
          </section>
        );
      })}
    </div>
  );
}
