'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@portfolio/ui/components/ui/tabs';
import { useTranslations } from 'next-intl';
import { usePathname, useSearchParams } from 'next/navigation';
import type { ReactNode } from 'react';

import { AdminAboutExperienceIndex } from '@/modules/admin-about/views/AdminAboutExperienceIndex';
import { AdminEducationIndex } from '@/modules/admin-about/views/AdminEducationIndex';
import { AdminPrinciplesIndex } from '@/modules/admin-about/views/AdminPrinciplesIndex';
import { AdminProcessStepsIndex } from '@/modules/admin-about/views/AdminProcessStepsIndex';
import { AdminProfileStatsIndex } from '@/modules/admin-about/views/AdminProfileStatsIndex';
import { AdminDomainsIndex } from '@/modules/admin-taxonomy/views/AdminDomainsIndex';
import { AdminSkillsIndex } from '@/modules/admin-taxonomy/views/AdminSkillsIndex';

const tabs = [
  'layout',
  'experience',
  'education',
  'skills',
  'principles',
  'process',
  'stats',
  'domains',
] as const;
type AboutTab = (typeof tabs)[number];

export function AdminAboutTabs({ layout }: { layout: ReactNode }) {
  const t = useTranslations('admin.nav');
  const path = usePathname();
  const search = useSearchParams();
  const requested = search.get('tab');
  const active: AboutTab = tabs.find((tab) => tab === requested) ?? 'layout';
  const content: Record<AboutTab, ReactNode> = {
    layout,
    experience: <AdminAboutExperienceIndex />,
    education: <AdminEducationIndex />,
    skills: <AdminSkillsIndex />,
    principles: <AdminPrinciplesIndex />,
    process: <AdminProcessStepsIndex />,
    stats: <AdminProfileStatsIndex />,
    domains: <AdminDomainsIndex />,
  };

  return (
    <div className="flex flex-col gap-4">
      <Tabs
        value={active}
        onValueChange={(tab) => {
          const next = new URLSearchParams();
          if (tab !== 'layout') next.set('tab', tab);
          const url = next.size ? `${path}?${next}` : path;
          if (url !== `${window.location.pathname}${window.location.search}`)
            window.history.pushState(null, '', url);
        }}
      >
        <TabsList aria-label={t('about')} className="h-auto flex-wrap justify-start">
          {tabs.map((tab) => (
            <TabsTrigger key={tab} value={tab}>
              {tab === 'layout' ? t('layout') : t(tab)}
            </TabsTrigger>
          ))}
        </TabsList>
        <TabsContent value={active}>{content[active]}</TabsContent>
      </Tabs>
    </div>
  );
}
