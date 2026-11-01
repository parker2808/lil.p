'use client';

import { loginSchema } from '@portfolio/contracts';
import { Button } from '@portfolio/ui/components/ui/button';
import { Field, FieldError, FieldLabel } from '@portfolio/ui/components/ui/field';
import { Input } from '@portfolio/ui/components/ui/input';
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
          <Field>
            <FieldLabel htmlFor={field.name}>{t('email')}</FieldLabel>
            <Input
              id={field.name}
              type="email"
              autoComplete="username"
              value={field.state.value}
              onBlur={field.handleBlur}
              onChange={(event) => field.handleChange(event.target.value)}
            />
            <FieldError>
              {field.state.meta.errors[0] ? String(field.state.meta.errors[0]) : null}
            </FieldError>
          </Field>
        )}
      </form.Field>
      <form.Field name="password">
        {(field) => (
          <Field>
            <FieldLabel htmlFor={field.name}>{t('password')}</FieldLabel>
            <Input
              id={field.name}
              type="password"
              autoComplete="current-password"
              value={field.state.value}
              onBlur={field.handleBlur}
              onChange={(event) => field.handleChange(event.target.value)}
            />
            <FieldError>
              {field.state.meta.errors[0] ? String(field.state.meta.errors[0]) : null}
            </FieldError>
          </Field>
        )}
      </form.Field>
      {formError ? <FieldError>{formError}</FieldError> : null}
      <Button type="submit" className="h-10" loading={submitting}>
        {t('submit')}
      </Button>
    </form>
  );
}
