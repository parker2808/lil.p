'use client';

import {
  CONTACT_MESSAGE_MAX,
  contactSchema,
  type Locale,
  type PublicContactTopic,
} from '@portfolio/contracts';
import { Alert } from '@portfolio/ui/components/ui/alert';
import { Button } from '@portfolio/ui/components/ui/button';
import { Field, FieldDescription, FieldError, FieldLabel } from '@portfolio/ui/components/ui/field';
import { Input } from '@portfolio/ui/components/ui/input';
import { Textarea } from '@portfolio/ui/components/ui/textarea';
import { useForm } from '@tanstack/react-form';
import { useMutation } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import { useActionState, useEffect, useRef, useState } from 'react';

import {
  type ContactActionResult,
  submitContact,
  submitContactForm,
} from '../../actions/contact.action';

function firstError(errors: unknown[]): string | null {
  const first = errors[0];
  if (!first) {
    return null;
  }
  if (typeof first === 'string') {
    return first;
  }
  if (typeof first === 'object' && first && 'message' in first) {
    return String((first as { message: unknown }).message);
  }
  return String(first);
}

export function ContactForm({ locale, topics }: { locale: Locale; topics: PublicContactTopic[] }) {
  const t = useTranslations('contact.form');
  const summaryRef = useRef<HTMLDivElement>(null);
  const [submitted, setSubmitted] = useState(false);
  const [actionState, formAction, actionPending] = useActionState(submitContactForm, null);
  const mutation = useMutation({ mutationFn: submitContact });
  const result: ContactActionResult | null = mutation.data ?? actionState;

  const form = useForm({
    defaultValues: {
      name: '',
      email: '',
      topic: '',
      message: '',
      website: '',
      locale,
    },
    validators: { onBlur: contactSchema as never, onSubmit: contactSchema as never },
    onSubmit: async ({ value }) => {
      await mutation.mutateAsync(value);
    },
  });

  useEffect(() => {
    if (submitted || (result && !result.ok)) {
      summaryRef.current?.focus();
    }
  }, [result, submitted]);

  if (result?.ok) {
    return (
      <div className="bg-card-glass border-border shadow-1 flex flex-col gap-3 rounded-xl border p-6">
        <p className="font-heading text-subheading font-semibold">{t('successTitle')}</p>
        <p className="text-prose text-muted-foreground">{t('successBody')}</p>
      </div>
    );
  }

  const fieldErrors = result && !result.ok ? (result.fieldErrors ?? {}) : {};
  const showSummary = submitted || (result !== null && !result.ok);

  return (
    <form
      action={formAction}
      className="bg-card-glass border-border shadow-1 relative flex flex-col gap-4 rounded-xl border p-6"
      noValidate
      onSubmit={(event) => {
        event.preventDefault();
        setSubmitted(true);
        void form.handleSubmit().then(() => {
          if (!form.state.isValid) {
            summaryRef.current?.focus();
          }
        });
      }}
    >
      {showSummary ? (
        <div ref={summaryRef} tabIndex={-1} className="outline-none">
          <Alert variant="destructive">{t('summary')}</Alert>
        </div>
      ) : null}
      {result && !result.ok && result.formError ? (
        <Alert variant="destructive">{t(result.formError)}</Alert>
      ) : null}

      <input type="hidden" name="locale" value={locale} />

      <div className="grid gap-4 sm:grid-cols-2">
        <form.Field name="name">
          {(field) => (
            <Field>
              <FieldLabel htmlFor="name">{t('name')}</FieldLabel>
              <Input
                id="name"
                name="name"
                autoComplete="name"
                value={field.state.value}
                aria-invalid={Boolean(firstError(field.state.meta.errors) || fieldErrors.name)}
                onBlur={field.handleBlur}
                onChange={(event) => field.handleChange(event.target.value)}
              />
              <FieldError>
                {firstError(field.state.meta.errors) ?? fieldErrors.name?.[0] ?? null}
              </FieldError>
            </Field>
          )}
        </form.Field>
        <form.Field name="email">
          {(field) => (
            <Field>
              <FieldLabel htmlFor="email">{t('email')}</FieldLabel>
              <Input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                value={field.state.value}
                aria-invalid={Boolean(firstError(field.state.meta.errors) || fieldErrors.email)}
                onBlur={field.handleBlur}
                onChange={(event) => field.handleChange(event.target.value)}
              />
              <FieldError>
                {firstError(field.state.meta.errors) ?? fieldErrors.email?.[0] ?? null}
              </FieldError>
            </Field>
          )}
        </form.Field>
      </div>

      {topics.length > 0 ? (
        <form.Field name="topic">
          {(field) => (
            <Field>
              <FieldLabel htmlFor="topic">{t('topic')}</FieldLabel>
              <select
                id="topic"
                name="topic"
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(event) => field.handleChange(event.target.value)}
                className="border-input bg-background text-ui flex h-8 w-full rounded-md border px-3"
              >
                <option value="">{t('topicPlaceholder')}</option>
                {topics.map((topic) => (
                  <option key={topic.id} value={topic.slug}>
                    {topic.label}
                  </option>
                ))}
              </select>
              <FieldError>
                {firstError(field.state.meta.errors) ?? fieldErrors.topic?.[0] ?? null}
              </FieldError>
            </Field>
          )}
        </form.Field>
      ) : null}

      <form.Field name="message">
        {(field) => (
          <Field>
            <FieldLabel htmlFor="message">{t('message')}</FieldLabel>
            <Textarea
              id="message"
              name="message"
              maxLength={CONTACT_MESSAGE_MAX}
              value={field.state.value}
              aria-invalid={Boolean(firstError(field.state.meta.errors) || fieldErrors.message)}
              onBlur={field.handleBlur}
              onChange={(event) => field.handleChange(event.target.value)}
            />
            <FieldDescription>
              {t('count', { count: field.state.value.length, max: CONTACT_MESSAGE_MAX })}
            </FieldDescription>
            <FieldError>
              {firstError(field.state.meta.errors) ?? fieldErrors.message?.[0] ?? null}
            </FieldError>
          </Field>
        )}
      </form.Field>

      <form.Field name="website">
        {(field) => (
          <div className="sr-only" aria-hidden="true">
            <label htmlFor="website">{t('honeypot')}</label>
            <input
              id="website"
              name="website"
              tabIndex={-1}
              autoComplete="off"
              value={field.state.value}
              onChange={(event) => field.handleChange(event.target.value)}
            />
          </div>
        )}
      </form.Field>

      <Button type="submit" disabled={mutation.isPending || actionPending}>
        {mutation.isPending || actionPending ? t('sending') : t('send')}
      </Button>
    </form>
  );
}
