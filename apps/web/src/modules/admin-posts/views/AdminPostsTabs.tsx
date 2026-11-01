'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@portfolio/ui/components/ui/tabs';
import { useTranslations } from 'next-intl';
import { usePathname, useSearchParams } from 'next/navigation';

import { AdminTagsIndex } from '@/modules/admin-taxonomy/views/AdminTagsIndex';

import { AdminPostsIndex } from './AdminPostsIndex';

export function AdminPostsTabs() {
  const t = useTranslations('admin.nav');
  const path = usePathname();
  const search = useSearchParams();
  const active = search.get('tab') === 'tags' ? 'tags' : 'posts';
  return (
    <div className="flex flex-col gap-4">
      <Tabs
        value={active}
        onValueChange={(tab) => {
          const url = tab === 'tags' ? `${path}?tab=tags` : path;
          if (url !== `${window.location.pathname}${window.location.search}`)
            window.history.pushState(null, '', url);
        }}
      >
        <TabsList aria-label={t('posts')}>
          <TabsTrigger value="posts">{t('posts')}</TabsTrigger>
          <TabsTrigger value="tags">{t('tags')}</TabsTrigger>
        </TabsList>
        <TabsContent value={active}>
          {active === 'tags' ? <AdminTagsIndex /> : <AdminPostsIndex />}
        </TabsContent>
      </Tabs>
    </div>
  );
}
