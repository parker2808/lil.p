'use client';

import { loginSchema } from '@portfolio/contracts';
import { Button } from '@portfolio/ui/components/ui/button';
import { FieldError } from '@portfolio/ui/components/ui/field';
import { FormField } from '@portfolio/ui/components/ui/form-field';
import { Input } from '@portfolio/ui/components/ui/input';
import { PasswordInput } from '@portfolio/ui/components/ui/password-input';
import { useForm } from '@tanstack/react-form';
import { useTranslations } from 'next-intl';
import { useState } from 'react';

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
            <PasswordInput
              id={field.name}
              autoComplete="current-password"
              value={field.state.value}
              onBlur={field.handleBlur}
              onChange={(event) => field.handleChange(event.target.value)}
            />
          </FormField>
        )}
      </form.Field>
      {formError ? <FieldError>{formError}</FieldError> : null}
      <Button type="submit" loading={submitting}>
        {t('submit')}
      </Button>
    </form>
  );
}
