import type { Locale } from '@portfolio/contracts';
import { ArrowLeft, ArrowRight, CornerDownRight, Sparkles } from 'lucide-react';

import { DemoContactForm } from './DemoContactForm';

const copy = {
  en: {
    notes: [
      'FIELD NOTES / 2026',
      'Thoughts from the edges of the work.',
      'Small observations on interfaces, systems, and the space between them.',
      'Read note',
      'Notes',
    ],
    about: [
      'A LITTLE CONTEXT',
      'Curious by design.',
      'I am Parker, a frontend engineer who cares about how a product feels as much as how it works.',
      'My practice',
      'I move between code, visual systems, and the details that make an interface feel human.',
      'What I value',
      'Clear thinking, considered craft, and room for wonder.',
      'Explore projects',
    ],
    contact: [
      'START A CONVERSATION',
      'Have something in mind?',
      'Tell me about the problem, the possibility, or the thing you cannot stop thinking about.',
      'Your name',
      'Your message',
      'Preview response',
      'This local demo does not send or save messages.',
      'Explore my work',
    ],
    missing: [
      'OFF THE MAP',
      'A little lost in space.',
      'This page is not part of the constellation. Find your way back to the work.',
      'Back to home',
    ],
    error: [
      'SIGNAL INTERRUPTED',
      'Something went quiet.',
      'The page could not load. Try again or return to the beginning.',
      'Try again',
      'Back to home',
    ],
    note: [
      'An interface is a conversation.',
      'On making complex tools feel simple',
      'The best interactions make the next step feel obvious, without hiding the depth beneath.',
      'The space between',
      'Good product work starts with attention: to context, to language, and to the moment a person needs to make a decision.',
      'A useful rhythm',
      'Build a clear hierarchy, repeat it with care, and let motion explain what changed. The system can be rich while each moment remains calm.',
    ],
  },
  vi: {
    notes: [
      'GHI CHÚ / 2026',
      'Ý tưởng bên lề công việc.',
      'Quan sát nhỏ về giao diện, hệ thống và khoảng không ở giữa.',
      'Đọc ghi chú',
      'Ghi chú',
    ],
    about: [
      'ĐÔI DÒNG',
      'Tò mò từ trong cách thiết kế.',
      'Tôi là Parker, một kỹ sư giao diện quan tâm đến cảm nhận của sản phẩm cũng như cách nó vận hành.',
      'Cách tôi làm',
      'Tôi kết nối mã nguồn, hệ thống thị giác và những chi tiết giúp giao diện gần gũi hơn.',
      'Điều tôi trân trọng',
      'Tư duy rõ ràng, tay nghề chỉn chu và không gian cho sự bất ngờ.',
      'Xem dự án',
    ],
    contact: [
      'BẮT ĐẦU TRÒ CHUYỆN',
      'Bạn có điều gì đang ấp ủ?',
      'Kể tôi nghe về vấn đề, khả năng hoặc ý tưởng khiến bạn không ngừng nghĩ đến.',
      'Tên của bạn',
      'Lời nhắn',
      'Xem phản hồi',
      'Bản thử nghiệm này không gửi hoặc lưu lời nhắn.',
      'Xem dự án',
    ],
    missing: [
      'LẠC ĐƯỜNG',
      'Lạc giữa các vì sao.',
      'Trang này không nằm trong chòm sao. Hãy trở lại và khám phá những dự án.',
      'Về trang chủ',
    ],
    error: [
      'MẤT TÍN HIỆU',
      'Tín hiệu tạm ngắt.',
      'Không thể tải trang. Hãy thử lại hoặc quay về điểm bắt đầu.',
      'Thử lại',
      'Về trang chủ',
    ],
    note: [
      'Giao diện là một cuộc trò chuyện.',
      'Làm công cụ phức tạp trở nên đơn giản',
      'Tương tác tốt giúp bước tiếp theo trở nên rõ ràng mà không che đi chiều sâu bên dưới.',
      'Khoảng không ở giữa',
      'Sản phẩm tốt bắt đầu từ sự chú ý: đến bối cảnh, ngôn ngữ và khoảnh khắc con người cần ra quyết định.',
      'Một nhịp điệu hữu ích',
      'Tạo thứ bậc rõ ràng, lặp lại thật chỉn chu và dùng chuyển động để giải thích sự thay đổi. Hệ thống có thể phong phú mà mỗi khoảnh khắc vẫn nhẹ nhàng.',
    ],
  },
} as const;

const posts = [
  {
    slug: 'interfaces-as-conversations',
    date: ['02 NOV 2026', '02 THG 11 2026'],
    category: ['DESIGN SYSTEMS', 'HỆ THỐNG THIẾT KẾ'],
  },
  {
    slug: 'making-space-for-clarity',
    date: ['21 OCT 2026', '21 THG 10 2026'],
    category: ['PROCESS', 'QUY TRÌNH'],
  },
  {
    slug: 'the-smallest-useful-motion',
    date: ['08 SEP 2026', '08 THG 09 2026'],
    category: ['INTERACTION', 'TƯƠNG TÁC'],
  },
] as const;

export const demoNoteSlugs: readonly string[] = posts.map((post) => post.slug);

export function DemoNotes({ locale }: { locale: Locale }) {
  const t = copy[locale].notes;
  return (
    <div className="demo-container demo-more-page">
      <header className="demo-page-intro">
        <p className="demo-eyebrow">{t[0]}</p>
        <h1>{t[1]}</h1>
        <p>{t[2]}</p>
      </header>
      <div className="demo-notes-list">
        {posts.map((post, i) => (
          <a className="demo-note-row" href={`/${locale}/notes/${post.slug}`} key={post.slug}>
            <span className="demo-eyebrow">
              0{i + 1} / {post.category[locale === 'en' ? 0 : 1]}
            </span>
            <h2>
              {i === 0
                ? copy[locale].note[1]
                : i === 1
                  ? locale === 'en'
                    ? 'Making space for clarity'
                    : 'Dành chỗ cho sự rõ ràng'
                  : locale === 'en'
                    ? 'The smallest useful motion'
                    : 'Chuyển động nhỏ mà hữu ích'}
            </h2>
            <p>
              {i === 0
                ? copy[locale].note[2]
                : locale === 'en'
                  ? 'A short reflection on shaping systems people can trust.'
                  : 'Suy ngẫm ngắn về cách tạo hệ thống đáng tin cậy.'}
            </p>
            <span className="demo-note-meta">
              {post.date[locale === 'en' ? 0 : 1]}
              <span>
                {t[3]} <ArrowRight size={16} aria-hidden />
              </span>
            </span>
          </a>
        ))}
      </div>
    </div>
  );
}

export function DemoNoteDetail({ locale, slug }: { locale: Locale; slug: string }) {
  const t = copy[locale].note;
  const i = posts.findIndex((post) => post.slug === slug);
  const title =
    i === 0
      ? t[1]
      : i === 1
        ? locale === 'en'
          ? 'Making space for clarity'
          : 'Dành chỗ cho sự rõ ràng'
        : locale === 'en'
          ? 'The smallest useful motion'
          : 'Chuyển động nhỏ mà hữu ích';
  return (
    <article className="demo-container demo-note-detail">
      <a className="demo-back" href={`/${locale}/notes`}>
        <ArrowLeft size={16} aria-hidden /> {copy[locale].notes[4]}
      </a>
      <header className="demo-page-intro">
        <p className="demo-eyebrow">
          {posts[Math.max(0, i)]?.date[locale === 'en' ? 0 : 1]} /{' '}
          {locale === 'en' ? 'DESIGN NOTES' : 'GHI CHÚ THIẾT KẾ'}
        </p>
        <h1>{title}</h1>
        <p>{t[2]}</p>
      </header>
      <div className="demo-note-body">
        <p className="demo-lede">{t[0]}</p>
        <h2>{t[3]}</h2>
        <p>{t[4]}</p>
        <div className="demo-quote">
          <Sparkles size={22} aria-hidden />
          <p>{t[2]}</p>
        </div>
        <h2>{t[5]}</h2>
        <p>{t[6]}</p>
        <a className="demo-text-link" href={`/${locale}/notes`}>
          {copy[locale].notes[4]} <ArrowRight size={16} aria-hidden />
        </a>
      </div>
    </article>
  );
}

export function DemoAbout({ locale }: { locale: Locale }) {
  const t = copy[locale].about;
  return (
    <div className="demo-container demo-more-page demo-about">
      <header className="demo-page-intro">
        <p className="demo-eyebrow">{t[0]}</p>
        <h1>{t[1]}</h1>
        <p>{t[2]}</p>
      </header>
      <div className="demo-about-grid">
        <div className="demo-about-art">
          <span className="demo-about-orbit" />
          <span className="demo-about-initials">lp.</span>
          <span className="demo-eyebrow">LIL.PARKER / 2026</span>
        </div>
        <div className="demo-about-copy">
          <section>
            <p className="demo-eyebrow">01 / {t[3]}</p>
            <h2>{t[4]}</h2>
          </section>
          <section>
            <p className="demo-eyebrow">02 / {t[5]}</p>
            <h2>{t[6]}</h2>
          </section>
          <a className="demo-button demo-button-primary" href={`/${locale}/projects`}>
            {t[7]} <ArrowRight size={17} aria-hidden />
          </a>
        </div>
      </div>
    </div>
  );
}

export function DemoContact({ locale }: { locale: Locale }) {
  const t = copy[locale].contact;
  return (
    <div className="demo-container demo-more-page demo-contact">
      <header className="demo-page-intro">
        <p className="demo-eyebrow">{t[0]}</p>
        <h1>{t[1]}</h1>
        <p>{t[2]}</p>
      </header>
      <div className="demo-contact-grid">
        <div>
          <span className="demo-contact-orbit">
            <CornerDownRight size={56} strokeWidth={1} aria-hidden />
          </span>
          <p className="demo-eyebrow">
            {locale === 'en' ? 'OPEN TO THE NEXT IDEA' : 'SẴN SÀNG CHO Ý TƯỞNG MỚI'}
          </p>
          <a className="demo-text-link" href={`/${locale}/projects`}>
            {t[7]} <ArrowRight size={16} aria-hidden />
          </a>
        </div>
        <DemoContactForm
          locale={locale}
          labels={{ name: t[3], message: t[4], submit: t[5], note: t[6] }}
        />
      </div>
    </div>
  );
}

export function DemoMissing({ locale }: { locale: Locale }) {
  const t = copy[locale].missing;
  return (
    <div className="demo-container demo-state">
      <span className="demo-state-code">404</span>
      <p className="demo-eyebrow">{t[0]}</p>
      <h1>{t[1]}</h1>
      <p>{t[2]}</p>
      <a className="demo-button demo-button-primary" href={`/${locale}`}>
        {t[3]} <ArrowRight size={17} aria-hidden />
      </a>
    </div>
  );
}

export function DemoEmpty({ locale }: { locale: Locale }) {
  return (
    <div className="demo-container demo-empty">
      <span className="demo-empty-symbol" aria-hidden="true">
        <Sparkles size={42} strokeWidth={1.5} />
      </span>
      <p className="demo-eyebrow">{locale === 'en' ? 'NOTHING HERE YET' : 'CHƯA CÓ NỘI DUNG'}</p>
      <h1>
        {locale === 'en'
          ? 'A little space for what comes next.'
          : 'Một khoảng trống cho điều sắp tới.'}
      </h1>
      <p>
        {locale === 'en'
          ? 'This collection is still taking shape. Explore the projects while new notes find their place.'
          : 'Bộ sưu tập vẫn đang hình thành. Hãy khám phá các dự án trong khi ghi chú mới tìm đúng vị trí.'}
      </p>
      <a className="demo-button demo-button-primary" href={`/${locale}/projects`}>
        {locale === 'en' ? 'Explore projects' : 'Khám phá dự án'}{' '}
        <ArrowRight size={17} aria-hidden />
      </a>
    </div>
  );
}

export function DemoError({ locale, reset }: { locale: Locale; reset: () => void }) {
  const t = copy[locale].error;
  return (
    <div className="demo-container demo-state">
      <span className="demo-state-code">500</span>
      <p className="demo-eyebrow">{t[0]}</p>
      <h1>{t[1]}</h1>
      <p>{t[2]}</p>
      <div className="demo-actions">
        <button className="demo-button demo-button-primary" onClick={reset} type="button">
          {t[3]}
        </button>
        <a className="demo-button demo-button-outline" href={`/${locale}`}>
          {t[4]}
        </a>
      </div>
    </div>
  );
}
