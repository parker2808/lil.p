'use client';

import type { AdminUser, CreateUserInput, Role, UpdateUserInput } from '@portfolio/contracts';
import { Button } from '@portfolio/ui/components/ui/button';
import { Field, FieldError, FieldLabel } from '@portfolio/ui/components/ui/field';
import { Input } from '@portfolio/ui/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@portfolio/ui/components/ui/select';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetTitle,
} from '@portfolio/ui/components/ui/sheet';
import { Switch } from '@portfolio/ui/components/ui/switch';
import { useTranslations } from 'next-intl';
import { useState } from 'react';

export function UserForm({
  user,
  open,
  onOpenChange,
  onCreate,
  onUpdate,
}: {
  user: AdminUser | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreate: (body: CreateUserInput) => Promise<unknown>;
  onUpdate: (id: number, body: UpdateUserInput) => Promise<unknown>;
}) {
  const t = useTranslations('admin.users');
  const isCreate = user === null;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent>
        <SheetTitle>{isCreate ? t('createTitle') : t('editTitle')}</SheetTitle>
        <SheetDescription>{t('formHint')}</SheetDescription>
        {open ? (
          <UserFormFields
            key={user?.id ?? 'new'}
            user={user}
            onCreate={onCreate}
            onUpdate={onUpdate}
            onClose={() => onOpenChange(false)}
          />
        ) : null}
      </SheetContent>
    </Sheet>
  );
}

function UserFormFields({
  user,
  onCreate,
  onUpdate,
  onClose,
}: {
  user: AdminUser | null;
  onCreate: (body: CreateUserInput) => Promise<unknown>;
  onUpdate: (id: number, body: UpdateUserInput) => Promise<unknown>;
  onClose: () => void;
}) {
  const t = useTranslations('admin.users');
  const [name, setName] = useState(user?.name ?? '');
  const [email, setEmail] = useState(user?.email ?? '');
  const [role, setRole] = useState<Role>(user?.role ?? 'user');
  const [password, setPassword] = useState('');
  const [isActive, setIsActive] = useState(user?.isActive ?? true);
  const [error, setError] = useState('');

  return (
    <form
      className="flex flex-col gap-3"
      onSubmit={(event) => {
        event.preventDefault();
        setError('');
        const task =
          user === null
            ? onCreate({ name, email, role, password })
            : onUpdate(user.id, { name, role, isActive });
        void task.then(() => onClose()).catch(() => setError(t('saveError')));
      }}
    >
      <Field>
        <FieldLabel htmlFor="user-name">{t('name')}</FieldLabel>
        <Input
          id="user-name"
          value={name}
          onChange={(event) => setName(event.target.value)}
          required
        />
      </Field>
      {user === null ? (
        <>
          <Field>
            <FieldLabel htmlFor="user-email">{t('email')}</FieldLabel>
            <Input
              id="user-email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="user-password">{t('password')}</FieldLabel>
            <Input
              id="user-password"
              type="password"
              value={password}
              minLength={12}
              onChange={(event) => setPassword(event.target.value)}
              required
            />
          </Field>
        </>
      ) : (
        <Field>
          <FieldLabel htmlFor="user-active">{t('active')}</FieldLabel>
          <Switch id="user-active" checked={isActive} onCheckedChange={setIsActive} />
        </Field>
      )}
      <Field>
        <FieldLabel htmlFor="user-role">{t('role')}</FieldLabel>
        <Select value={role} onValueChange={(next) => setRole(next as Role)}>
          <SelectTrigger id="user-role">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="admin">{t('roleAdmin')}</SelectItem>
            <SelectItem value="user">{t('roleUser')}</SelectItem>
          </SelectContent>
        </Select>
      </Field>
      <FieldError>{error}</FieldError>
      <Button type="submit">{t('save')}</Button>
    </form>
  );
}
