'use client';

import { loginSchema } from '@portfolio/contracts';
import { Button } from '@portfolio/ui/components/ui/button';
import { FieldError } from '@portfolio/ui/components/ui/field';
import { FormField } from '@portfolio/ui/components/ui/form-field';
import { Input } from '@portfolio/ui/components/ui/input';
import { useForm } from '@tanstack/react-form';
import { Eye, EyeOff } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { type ChangeEvent, useState } from 'react';

import { login } from '@/modules/admin-core/services/auth.service';
import { ApiError } from '@/modules/core/utils/api-error.util';

export function LoginForm({ onSignedIn }: { onSignedIn: () => void }) {
  const t = useTranslations('admin.login');
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const form = useForm({
    defaultValues: { email: '', password: '' },
    validators: { onSubmit: loginSchema },
    onSubmit: async ({ value }) => {
      setFormError(null);
      setSubmitting(true);
      try {
        await login(value);
        onSignedIn();
      } catch (error) {
        if (error instanceof ApiError) {
          if (error.status === 429) {
            setFormError(t('rateLimited'));
            return;
          }
          setFormError(error.message || t('invalid'));
          return;
        }
        setFormError(t('invalid'));
      } finally {
        setSubmitting(false);
      }
    },
  });

  return (
    <form
      className="flex flex-col gap-4"
      onSubmit={(event) => {
        event.preventDefault();
        void form.handleSubmit();
      }}
    >
      <form.Field name="email">
        {(field) => (
          <FormField label={t('email')} required error={field.state.meta.errors[0]?.message}>
            <Input
              id={field.name}
              type="email"
              className="min-h-11"
              autoComplete="username"
              value={field.state.value}
              onBlur={field.handleBlur}
              onChange={(event) => field.handleChange(event.target.value)}
            />
          </FormField>
        )}
      </form.Field>
      <form.Field name="password">
        {(field) => (
          <FormField label={t('password')} required error={field.state.meta.errors[0]?.message}>
            <AdminPasswordInput
              id={field.name}
              value={field.state.value}
              onBlur={field.handleBlur}
              onChange={(event) => field.handleChange(event.target.value)}
            />
          </FormField>
        )}
      </form.Field>
      {formError ? <FieldError>{formError}</FieldError> : null}
      <Button type="submit" loading={submitting} className="min-h-11">
        {t('submit')}
      </Button>
    </form>
  );
}

function AdminPasswordInput({
  id,
  value,
  onBlur,
  onChange,
}: {
  id: string;
  value: string;
  onBlur: () => void;
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
}) {
  const t = useTranslations('admin.login');
  const [visible, setVisible] = useState(false);
  return (
    <div className="relative w-full">
      <Input
        id={id}
        type={visible ? 'text' : 'password'}
        autoComplete="current-password"
        className="min-h-11 pr-11"
        value={value}
        onBlur={onBlur}
        onChange={onChange}
      />
      <button
        type="button"
        className="text-muted-foreground hover:text-accent-foreground focus-visible:outline-ring absolute inset-y-0 right-0 flex w-11 items-center justify-center rounded-r-md focus-visible:outline-2 focus-visible:outline-offset-2"
        aria-label={visible ? t('hidePassword') : t('showPassword')}
        aria-pressed={visible}
        onClick={() => setVisible((current) => !current)}
      >
        {visible ? (
          <EyeOff aria-hidden className="size-4" />
        ) : (
          <Eye aria-hidden className="size-4" />
        )}
      </button>
    </div>
  );
}
