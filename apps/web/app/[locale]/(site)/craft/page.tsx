import type { Locale } from '@portfolio/contracts';
import { Asterisk } from 'lucide-react';
import type { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';

import { buildAlternates } from '@/modules/seo/utils/alternates.util';

const copy = {
  en: {
    eyebrow: 'THE PLAYGROUND',
    title: 'Small things, carefully made.',
    intro:
      'A gallery of interaction experiments. Move, hover, and explore; each study keeps the same care on touch and reduced motion.',
    studies: [
      ['MOTION', 'Magnetic orbit', 'A point of focus and two paths in motion.'],
      ['COLOR', 'Signal field', 'Depth from gradients, without a heavy renderer.'],
      ['TYPE', 'Type rhythm', 'Words arranged with deliberate pace.'],
      ['RESPONSE', 'Material response', 'A surface that follows your attention.'],
    ],
  },
  vi: {
    eyebrow: 'KHÔNG GIAN THỬ NGHIỆM',
    title: 'Điều nhỏ, làm thật kỹ.',
    intro:
      'Bộ sưu tập thử nghiệm tương tác. Di chuyển, chạm và khám phá; mỗi mẫu đều hỗ trợ cảm ứng và giảm chuyển động.',
    studies: [
      ['CHUYỂN ĐỘNG', 'Quỹ đạo hút', 'Một tâm điểm và hai đường chuyển động.'],
      ['MÀU SẮC', 'Trường tín hiệu', 'Chiều sâu bằng gradient, không cần bộ dựng nặng.'],
      ['CHỮ', 'Nhịp điệu chữ', 'Con chữ được sắp xếp có chủ đích.'],
      ['PHẢN HỒI', 'Bề mặt phản hồi', 'Một bề mặt đi theo sự chú ý.'],
    ],
  },
} as const;

function studyLabel(index: number, category: string): string {
  return `${String(index + 1).padStart(2, '0')} / ${category}`;
}

export function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  return params.then(({ locale }) => ({
    title: copy[locale === 'vi' ? 'vi' : 'en'].title,
    alternates: buildAlternates(locale === 'vi' ? 'vi' : 'en', '/craft'),
  }));
}

export const revalidate = 3600;

export default async function CraftPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: rawLocale } = await params;
  const locale: Locale = rawLocale === 'vi' ? 'vi' : 'en';
  setRequestLocale(locale);
  const t = copy[locale];

  return (
    <div className="public-index public-craft site-container">
      <header className="craft-intro">
        <p className="craft-eyebrow">{t.eyebrow}</p>
        <h1>{t.title}</h1>
        <p>{t.intro}</p>
      </header>
      <div className="craft-grid">
        {t.studies.map(([category, title, description], index) => (
          <article className={`craft-study craft-study-${index + 1}`} key={title}>
            <div className="craft-stage" aria-hidden="true">
              {index === 0 ? (
                <>
                  <span className="craft-orbit-center" />
                  <span className="craft-orbit craft-orbit-one" />
                  <span className="craft-orbit craft-orbit-two" />
                </>
              ) : null}
              {index === 1 ? <span className="craft-signal" /> : null}
              {index === 2 ? (
                <span className="craft-type-art">
                  {locale === 'en' ? 'Make space for ideas.' : 'Dành chỗ cho ý tưởng.'}
                </span>
              ) : null}
              {index === 3 ? (
                <span className="craft-material">
                  <Asterisk size={64} strokeWidth={1} />
                </span>
              ) : null}
            </div>
            <div className="craft-caption">
              <span>{studyLabel(index, category)}</span>
              <h2>{title}</h2>
              <p>{description}</p>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
