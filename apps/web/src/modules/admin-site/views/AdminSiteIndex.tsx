'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@portfolio/ui/components/ui/tabs';
import { useSearchParams } from 'next/navigation';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';

import { useIsAdmin } from '@/modules/admin-core/hooks/use-me.hook';
import {
  useMoveSmallEntity,
  useSmallEntityList,
  useUpdateSmallEntity,
} from '@/modules/admin-core/hooks/use-small-entity.hook';

import { NavTable } from '../components/NavTable/NavTable';
import { SettingsForm } from '../components/SettingsForm/SettingsForm';
import { SocialTable } from '../components/SocialTable/SocialTable';
import { TopicsTable } from '../components/TopicsTable/TopicsTable';
import { useAdminSite, useSaveAdminSite } from '../hooks/use-admin-site.hook';
import { navigationApi } from '../services/navigation.service';
import { socialLinksApi } from '../services/social-links.service';

const TABS = ['settings', 'nav', 'social', 'topics'] as const;

export function AdminSiteIndex() {
  const t = useTranslations('admin.site');
  const router = useRouter();
  const search = useSearchParams();
  const tab = TABS.includes(search.get('tab') as (typeof TABS)[number])
    ? (search.get('tab') as (typeof TABS)[number])
    : 'settings';
  const readOnly = !useIsAdmin();
  const site = useAdminSite();
  const saveSite = useSaveAdminSite();
  const nav = useSmallEntityList('navigation', navigationApi);
  const updateNav = useUpdateSmallEntity('navigation', navigationApi);
  const moveNav = useMoveSmallEntity('navigation', navigationApi);
  const social = useSmallEntityList('social-links', socialLinksApi);
  const updateSocial = useUpdateSmallEntity('social-links', socialLinksApi);
  const moveSocial = useMoveSmallEntity('social-links', socialLinksApi);

  const navItems = nav.data ?? [];
  const socialItems = social.data ?? [];

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-ui-title font-semibold">{t('title')}</h1>
      {site.isError ? <p className="text-destructive">{t('loadError')}</p> : null}
      <Tabs
        value={tab}
        onValueChange={(value) => {
          const next = new URLSearchParams(search.toString());
          next.set('tab', value);
          router.replace(`/admin/site?${next.toString()}`);
        }}
      >
        <TabsList>
          <TabsTrigger value="settings">{t('tabs.settings')}</TabsTrigger>
          <TabsTrigger value="nav">{t('tabs.nav')}</TabsTrigger>
          <TabsTrigger value="social">{t('tabs.social')}</TabsTrigger>
          <TabsTrigger value="topics">{t('tabs.topics')}</TabsTrigger>
        </TabsList>
        <TabsContent value="settings" className="pt-4">
          {site.data ? (
            <SettingsForm
              key={site.data.updatedAt}
              initial={site.data}
              readOnly={readOnly}
              labels={{
                siteName: t('siteName'),
                domain: t('domain'),
                seoTitleEn: t('seoTitleEn'),
                seoTitleVi: t('seoTitleVi'),
                seoDescriptionEn: t('seoDescriptionEn'),
                seoDescriptionVi: t('seoDescriptionVi'),
                footerNoteEn: t('footerNoteEn'),
                footerNoteVi: t('footerNoteVi'),
                contactIntroEn: t('contactIntroEn'),
                contactIntroVi: t('contactIntroVi'),
                replyTimeEn: t('replyTimeEn'),
                replyTimeVi: t('replyTimeVi'),
                contactEmail: t('contactEmail'),
                availability: t('availability'),
                open: t('open'),
                notLooking: t('notLooking'),
                freelance: t('freelance'),
                availabilityNoteEn: t('availabilityNoteEn'),
                availabilityNoteVi: t('availabilityNoteVi'),
                analytics: t('analytics'),
                ambient: t('ambient'),
                marquee: t('marquee'),
                save: t('save'),
                ogImage: t('ogImage'),
                choose: t('choose'),
                clear: t('clear'),
                emptyMedia: t('emptyMedia'),
              }}
              onSave={async (values) => {
                await saveSite.mutateAsync({
                  siteName: values.siteName,
                  domain: values.domain,
                  defaultLocale: values.defaultLocale,
                  seoTitleEn: values.seoTitleEn,
                  seoTitleVi: values.seoTitleVi,
                  seoDescriptionEn: values.seoDescriptionEn,
                  seoDescriptionVi: values.seoDescriptionVi,
                  footerNoteEn: values.footerNoteEn,
                  footerNoteVi: values.footerNoteVi,
                  contactIntroEn: values.contactIntroEn,
                  contactIntroVi: values.contactIntroVi,
                  replyTimeNoteEn: values.replyTimeNoteEn,
                  replyTimeNoteVi: values.replyTimeNoteVi,
                  contactEmail: values.contactEmail,
                  availability: values.availability,
                  availabilityNoteEn: values.availabilityNoteEn,
                  availabilityNoteVi: values.availabilityNoteVi,
                  analyticsEnabled: values.analyticsEnabled,
                  ambientEffects: values.ambientEffects,
                  marqueeEnabled: values.marqueeEnabled,
                  ogImageId: values.ogImageId ?? null,
                });
              }}
            />
          ) : (
            <p>{t('loading')}</p>
          )}
        </TabsContent>
        <TabsContent value="nav" className="pt-4">
          <NavTable
            items={navItems}
            readOnly={readOnly}
            labels={{
              label: t('navLabel'),
              href: t('navHref'),
              custom: t('navCustom'),
              moveUp: t('moveUp'),
              moveDown: t('moveDown'),
            }}
            onLabelChange={(id, labelEn) => {
              void updateNav.mutateAsync({ id, body: { labelEn } });
            }}
            onHrefChange={(id, href) => {
              void updateNav.mutateAsync({ id, body: { href } });
            }}
            onMove={(id, direction) => {
              moveNav.mutate({ id, direction });
            }}
          />
        </TabsContent>
        <TabsContent value="social" className="pt-4">
          <SocialTable
            items={socialItems}
            readOnly={readOnly}
            labels={{
              header: t('socialHeader'),
              cta: t('socialCta'),
              moveUp: t('moveUp'),
              moveDown: t('moveDown'),
            }}
            onToggle={(id, field, value) => {
              void updateSocial.mutateAsync({ id, body: { [field]: value } });
            }}
            onMove={(id, direction) => {
              moveSocial.mutate({ id, direction });
            }}
          />
        </TabsContent>
        <TabsContent value="topics" className="pt-4">
          <TopicsTable />
        </TabsContent>
      </Tabs>
    </div>
  );
}
