'use client';

import { Button } from '@portfolio/ui/components/ui/button';
import { Dialog, DialogContent, DialogTitle } from '@portfolio/ui/components/ui/dialog';
import { Field, FieldError, FieldLabel } from '@portfolio/ui/components/ui/field';
import { Input } from '@portfolio/ui/components/ui/input';
import { useTranslations } from 'next-intl';
import { useState } from 'react';

import { apiClient } from '@/modules/core/services/api-client.service';

export function ChangePasswordDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const t = useTranslations('admin.password');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [error, setError] = useState('');

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogTitle>{t('title')}</DialogTitle>
        <form
          className="flex flex-col gap-3"
          onSubmit={(event) => {
            event.preventDefault();
            setError('');
            void apiClient('/api/auth/password', {
              method: 'PATCH',
              headers: { 'content-type': 'application/json' },
              body: JSON.stringify({ currentPassword, newPassword }),
            })
              .then(() => {
                setCurrentPassword('');
                setNewPassword('');
                onOpenChange(false);
              })
              .catch(() => setError(t('invalid')));
          }}
        >
          <Field>
            <FieldLabel htmlFor="current-password">{t('current')}</FieldLabel>
            <Input
              id="current-password"
              type="password"
              value={currentPassword}
              onChange={(event) => setCurrentPassword(event.target.value)}
              required
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="new-password">{t('next')}</FieldLabel>
            <Input
              id="new-password"
              type="password"
              minLength={12}
              value={newPassword}
              onChange={(event) => setNewPassword(event.target.value)}
              required
            />
          </Field>
          <FieldError>{error}</FieldError>
          <Button type="submit">{t('save')}</Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
