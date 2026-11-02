'use client';

import { ArrowRight, Check } from 'lucide-react';
import { useRef, useState, type FormEvent } from 'react';

export function DemoContactForm({
  locale,
  labels,
}: {
  locale: 'en' | 'vi';
  labels: { name: string; message: string; submit: string; note: string };
}) {
  const [name, setName] = useState('');
  const [message, setMessage] = useState('');
  const [errors, setErrors] = useState<{ name?: string; message?: string }>({});
  const [previewed, setPreviewed] = useState(false);
  const nameRef = useRef<HTMLInputElement>(null);
  const messageRef = useRef<HTMLTextAreaElement>(null);

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const next = {
      name:
        name.trim().length < 2
          ? locale === 'en'
            ? 'Enter at least 2 characters.'
            : 'Nhập ít nhất 2 ký tự.'
          : undefined,
      message:
        message.trim().length < 10
          ? locale === 'en'
            ? 'Tell me a little more (10 characters minimum).'
            : 'Hãy viết thêm một chút (tối thiểu 10 ký tự).'
          : undefined,
    };
    setErrors(next);
    if (next.name) return nameRef.current?.focus();
    if (next.message) return messageRef.current?.focus();
    setName('');
    setMessage('');
    setPreviewed(true);
  }

  if (previewed)
    return (
      <div className="demo-contact-form demo-contact-success" role="status">
        <span className="demo-success-icon">
          <Check size={30} aria-hidden />
        </span>
        <p className="demo-eyebrow">
          {locale === 'en' ? 'RESPONSE PREVIEW' : 'XEM TRƯỚC PHẢN HỒI'}
        </p>
        <h2>
          {locale === 'en'
            ? 'A thoughtful reply starts here.'
            : 'Một phản hồi chu đáo bắt đầu từ đây.'}
        </h2>
        <p>
          {locale === 'en'
            ? 'This is a preview of the confirmation state. Your message was not sent or saved.'
            : 'Đây là bản xem trước trạng thái xác nhận. Lời nhắn không được gửi hoặc lưu.'}
        </p>
        <button
          className="demo-button demo-button-outline"
          type="button"
          onClick={() => {
            setPreviewed(false);
            setErrors({});
          }}
        >
          {locale === 'en' ? 'Write another preview' : 'Viết bản xem trước khác'}
        </button>
      </div>
    );

  return (
    <form className="demo-contact-form" noValidate onSubmit={submit}>
      <label htmlFor="demo-contact-name">{labels.name}</label>
      <input
        id="demo-contact-name"
        ref={nameRef}
        type="text"
        autoComplete="name"
        value={name}
        onChange={(event) => {
          setName(event.target.value);
          setErrors((current) => ({ ...current, name: undefined }));
        }}
        aria-invalid={!!errors.name}
        aria-describedby={errors.name ? 'demo-name-error' : undefined}
        placeholder={labels.name}
      />
      {errors.name ? (
        <p className="demo-field-error" id="demo-name-error">
          {errors.name}
        </p>
      ) : null}
      <label htmlFor="demo-contact-message">{labels.message}</label>
      <textarea
        id="demo-contact-message"
        ref={messageRef}
        rows={5}
        value={message}
        onChange={(event) => {
          setMessage(event.target.value);
          setErrors((current) => ({ ...current, message: undefined }));
        }}
        aria-invalid={!!errors.message}
        aria-describedby={errors.message ? 'demo-message-error' : undefined}
        placeholder={locale === 'en' ? 'What are you working on?' : 'Bạn đang thực hiện điều gì?'}
      />
      {errors.message ? (
        <p className="demo-field-error" id="demo-message-error">
          {errors.message}
        </p>
      ) : null}
      <p>{labels.note}</p>
      <button className="demo-button demo-button-primary" type="submit">
        {labels.submit} <ArrowRight size={17} aria-hidden />
      </button>
    </form>
  );
}
