'use client';

import type { AdminUser } from '@portfolio/contracts';
import { adminUserListParamsSchema } from '@portfolio/contracts';
import { FilterBar } from '@portfolio/ui/components/FilterBar/FilterBar';
import { Button } from '@portfolio/ui/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@portfolio/ui/components/ui/alert-dialog';
import { Field, FieldLabel } from '@portfolio/ui/components/ui/field';
import { Input } from '@portfolio/ui/components/ui/input';
import { useTranslations } from 'next-intl';
import { useState } from 'react';

import { useIsAdmin } from '@/modules/admin-core/hooks/use-me.hook';
import { useListParams } from '@/modules/admin-core/hooks/use-list-params.hook';
import { adminTableLabels } from '@/modules/admin-core/utils/table-labels.util';

import { UserForm } from '../components/UserForm/UserForm';
import { UsersTable } from '../components/UsersTable/UsersTable';
import { useAdminUsers, useUserMutations } from '../hooks/use-admin-users.hook';

export function AdminUsersIndex() {
  const t = useTranslations('admin.users');
  const table = useTranslations('admin.table');
  const canWrite = useIsAdmin();
  const { params, setParams } = useListParams(adminUserListParamsSchema);
  const { data, isError, refetch, isPending, isFetching } = useAdminUsers(params);
  const mutations = useUserMutations();
  const list = data ?? { items: [], page: params.page, pageSize: params.pageSize, total: 0 };
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<AdminUser | null>(null);
  const [signOutTarget, setSignOutTarget] = useState<AdminUser | null>(null);
  const [passwordTarget, setPasswordTarget] = useState<AdminUser | null>(null);
  const [nextPassword, setNextPassword] = useState('');

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-ui-title font-semibold">{t('title')}</h1>
        {canWrite ? (
          <Button
            type="button"
            size="sm"
            onClick={() => {
              setEditing(null);
              setFormOpen(true);
            }}
          >
            {t('new')}
          </Button>
        ) : null}
      </div>
      <FilterBar
        q={params.q ?? ''}
        onQChange={(q) => setParams({ q: q || undefined, page: 1 })}
        placeholder={t('search')}
        chips={[]}
        onRemoveChip={() => undefined}
        filters={[]}
        onAddFilter={() => undefined}
        labels={{ add: t('addFilter'), remove: t('removeChip') }}
      />
      <UsersTable
        items={list.items}
        total={list.total}
        page={list.page}
        pageSize={list.pageSize}
        sort={params.sort}
        hasFilters={Boolean(params.q)}
        isError={isError}
        isLoading={isPending}
        isFetching={isFetching}
        canWrite={canWrite}
        labels={adminTableLabels(table, {
          empty: t('empty'),
          emptyAction: t('new'),
          noResults: t('noResults'),
          clearFilters: t('clearFilters'),
          error: t('error'),
          selected: t('selected'),
          range: t('range'),
          confirmDeleteTitle: t('confirmDeleteTitle'),
          confirmDelete: t('confirmDelete'),
          bulkDelete: t('delete'),
        })}
        columnLabels={{
          name: t('name'),
          email: t('email'),
          role: t('role'),
          active: t('active'),
          lastLogin: t('lastLogin'),
          actions: t('actions'),
          signOut: t('signOut'),
          setPassword: t('setPassword'),
        }}
        onSortChange={(sort) => setParams({ sort: sort as typeof params.sort, page: 1 })}
        onPageChange={(page) => setParams({ page })}
        onCreate={() => {
          setEditing(null);
          setFormOpen(true);
        }}
        onEdit={(row) => {
          setEditing(row);
          setFormOpen(true);
        }}
        onClearFilters={() => setParams({ q: undefined, page: 1 })}
        onRetry={() => void refetch()}
        onToggleActive={(row, isActive) =>
          mutations.update.mutate({ id: row.id, body: { isActive } })
        }
        onSignOut={setSignOutTarget}
        onSetPassword={(row) => {
          setNextPassword('');
          setPasswordTarget(row);
        }}
      />
      <UserForm
        user={editing}
        open={formOpen}
        onOpenChange={setFormOpen}
        onCreate={(body) => mutations.create.mutateAsync(body)}
        onUpdate={(id, body) => mutations.update.mutateAsync({ id, body })}
      />
      <AlertDialog
        open={signOutTarget !== null}
        onOpenChange={(open) => !open && setSignOutTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('confirmSignOutTitle')}</AlertDialogTitle>
            <AlertDialogDescription>{t('confirmSignOut')}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('cancel')}</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (signOutTarget) {
                  mutations.signOut.mutate(signOutTarget.id);
                }
                setSignOutTarget(null);
              }}
            >
              {t('signOut')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <AlertDialog
        open={passwordTarget !== null}
        onOpenChange={(open) => !open && setPasswordTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('setPassword')}</AlertDialogTitle>
            <AlertDialogDescription>{t('setPasswordHint')}</AlertDialogDescription>
          </AlertDialogHeader>
          <Field>
            <FieldLabel htmlFor="set-user-password">{t('password')}</FieldLabel>
            <Input
              id="set-user-password"
              type="password"
              minLength={12}
              value={nextPassword}
              onChange={(event) => setNextPassword(event.target.value)}
            />
          </Field>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('cancel')}</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (passwordTarget && nextPassword.length >= 12) {
                  mutations.setPassword.mutate({ id: passwordTarget.id, password: nextPassword });
                }
                setPasswordTarget(null);
              }}
            >
              {t('save')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
