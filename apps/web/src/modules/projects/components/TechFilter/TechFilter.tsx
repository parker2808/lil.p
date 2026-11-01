'use client';

import type { PublicSkillChip } from '@portfolio/contracts';
import { ChevronDown } from 'lucide-react';
import dynamic from 'next/dynamic';
import { useState } from 'react';

type TechFilterProps = {
  skills: PublicSkillChip[];
  activeSlug?: string;
  domain?: string;
  labels: { tech: string; any: string; empty: string; search: string };
};

const loadMenu = () => import('./TechFilterMenu').then((module) => module.TechFilterMenu);

function TechFilterTrigger({
  label,
  current,
  onOpen,
}: {
  label: string;
  current: string;
  onOpen?: () => void;
}) {
  return (
    <button
      type="button"
      aria-haspopup="dialog"
      aria-expanded={false}
      onClick={onOpen}
      onPointerEnter={() => void loadMenu()}
      onFocus={() => void loadMenu()}
      className="border-border bg-card text-meta hover:border-border-strong inline-flex shrink-0 items-center gap-2 rounded-md border px-2.5 py-1"
    >
      <span>{label}</span>
      <ChevronDown aria-hidden className="size-3.5" />
      <span>{current}</span>
    </button>
  );
}

/**
 * Renders a light trigger; the first click swaps in the popover and command list
 * (`TechFilterMenu`), so they stay out of the page bundle until needed.
 */
export function TechFilter(props: TechFilterProps) {
  const [requested, setRequested] = useState(false);
  const current =
    props.skills.find((skill) => skill.slug === props.activeSlug)?.name ?? props.labels.any;

  if (!requested) {
    return (
      <TechFilterTrigger
        label={props.labels.tech}
        current={current}
        onOpen={() => setRequested(true)}
      />
    );
  }
  return <LazyTechFilterMenu {...props} defaultOpen />;
}

const LazyTechFilterMenu = dynamic(loadMenu, { ssr: false });
