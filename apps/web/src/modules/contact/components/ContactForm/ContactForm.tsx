'use client';

import {
  CONTACT_MESSAGE_MAX,
  contactSchema,
  type Locale,
  type PublicContactTopic,
} from '@portfolio/contracts';
import { Alert } from '@portfolio/ui/components/ui/alert';
import { Button } from '@portfolio/ui/components/ui/button';
import { FormField } from '@portfolio/ui/components/ui/form-field';
import { Input } from '@portfolio/ui/components/ui/input';
import { Textarea } from '@portfolio/ui/components/ui/textarea';
import { useForm } from '@tanstack/react-form';
import { useTranslations } from 'next-intl';
import { useActionState, useEffect, useRef, useState } from 'react';

import { submitContactForm } from '../../actions/contact.action';
import { submitContactClient } from '../../actions/contact.client';
import type { ContactActionResult } from '../../actions/contact.result';

function postedFields(form: HTMLFormElement): {
  name: string;
  email: string;
  topic: string;
  message: string;
  website: string;
  locale: Locale;
} {
  const data = new FormData(form);
  const locale = String(data.get('locale') ?? 'en');
  return {
    name: String(data.get('name') ?? ''),
    email: String(data.get('email') ?? ''),
    topic: String(data.get('topic') ?? ''),
    message: String(data.get('message') ?? ''),
    website: String(data.get('website') ?? ''),
    locale: locale === 'vi' ? 'vi' : 'en',
  };
}

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
  const [validationErrors, setValidationErrors] = useState<Record<string, string[]>>({});
  const [actionState, formAction, actionPending] = useActionState(submitContactForm, null);
  const [clientResult, setClientResult] = useState<ContactActionResult | null>(null);
  const [clientPending, setClientPending] = useState(false);
  const result: ContactActionResult | null = clientResult ?? actionState;
  const pending = clientPending || actionPending;

  const form = useForm({
    defaultValues: {
      name: '',
      email: '',
      topic: '',
      message: '',
      website: '',
      locale,
    },
    validators: { onBlur: contactSchema as never },
  });

  function sendFrom(formEl: HTMLFormElement): boolean {
    const posted = postedFields(formEl);
    form.setFieldValue('name', posted.name);
    form.setFieldValue('email', posted.email);
    form.setFieldValue('topic', posted.topic);
    form.setFieldValue('message', posted.message);
    form.setFieldValue('website', posted.website);
    form.setFieldValue('locale', posted.locale);
    const parsed = contactSchema.safeParse(posted);
    if (!parsed.success) {
      const errors = parsed.error.flatten().fieldErrors;
      setValidationErrors(errors);
      setSubmitted(true);
      const firstInvalid = (['name', 'email', 'message'] as const).find(
        (name) => errors[name]?.length,
      );
      if (firstInvalid) {
        formEl.querySelector<HTMLElement>(`[name="${firstInvalid}"]`)?.focus();
      }
      return false;
    }
    setValidationErrors({});
    setClientPending(true);
    void submitContactClient(parsed.data)
      .then((next) => {
        setClientResult(next);
      })
      .catch(() => {
        setClientResult({ ok: false, formError: 'failed' });
        summaryRef.current?.focus();
      })
      .finally(() => {
        setClientPending(false);
      });
    return true;
  }

  useEffect(() => {
    if (result && !result.ok) {
      summaryRef.current?.focus();
    }
  }, [result]);

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
        sendFrom(event.currentTarget);
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
            <FormField
              label={t('name')}
              required
              error={
                validationErrors.name?.[0] ??
                firstError(field.state.meta.errors) ??
                fieldErrors.name?.[0]
              }
            >
              <Input
                id="name"
                name="name"
                autoComplete="name"
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(event) => {
                  field.handleChange(event.target.value);
                  setValidationErrors((errors) => ({ ...errors, name: [] }));
                }}
              />
            </FormField>
          )}
        </form.Field>
        <form.Field name="email">
          {(field) => (
            <FormField
              label={t('email')}
              required
              error={
                validationErrors.email?.[0] ??
                firstError(field.state.meta.errors) ??
                fieldErrors.email?.[0]
              }
            >
              <Input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(event) => {
                  field.handleChange(event.target.value);
                  setValidationErrors((errors) => ({ ...errors, email: [] }));
                }}
              />
            </FormField>
          )}
        </form.Field>
      </div>

      {topics.length > 0 ? (
        <form.Field name="topic">
          {(field) => (
            <FormField
              label={t('topic')}
              error={firstError(field.state.meta.errors) ?? fieldErrors.topic?.[0]}
            >
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
            </FormField>
          )}
        </form.Field>
      ) : null}

      <form.Field name="message">
        {(field) => (
          <FormField
            label={t('message')}
            required
            maxLength={CONTACT_MESSAGE_MAX}
            error={
              validationErrors.message?.[0] ??
              firstError(field.state.meta.errors) ??
              fieldErrors.message?.[0]
            }
          >
            <Textarea
              id="message"
              name="message"
              value={field.state.value}
              onBlur={field.handleBlur}
              onChange={(event) => {
                field.handleChange(event.target.value);
                setValidationErrors((errors) => ({ ...errors, message: [] }));
              }}
            />
          </FormField>
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

      <Button surface="public" type="submit" loading={pending}>
        {t('send')}
      </Button>
    </form>
  );
}
