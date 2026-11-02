import type { Locale } from '@portfolio/contracts';
import type { ReactNode } from 'react';
import { ArrowDownRight, ArrowRight, Asterisk } from 'lucide-react';
import { BrandMark } from '@portfolio/ui/components/BrandMark/BrandMark';

import { DemoLanguageSwitch } from './DemoLanguageSwitch';
import { DemoModeProvider } from './DemoMode';
import { DemoSpotlightCard } from './DemoSpotlightCard';
import { demoCopy, demoProjects } from './data';

import './demo.css';

export function DemoShell({ locale, children }: { locale: Locale; children: ReactNode }) {
  const t = demoCopy[locale];
  return (
    <DemoModeProvider>
      <div className="design-demo min-h-dvh">
        <a className="demo-skip" href="#content">
          {locale === 'en' ? 'Skip to content' : 'Đến nội dung'}
        </a>
        <header className="demo-header">
          <div className="demo-container demo-header-inner">
            <a className="demo-brand" href={`/${locale}`} aria-label="lil.p home">
              <BrandMark className="demo-brand-logo" />
              <span>lil.parker</span>
            </a>
            <nav aria-label={locale === 'en' ? 'Main navigation' : 'Điều hướng chính'}>
              <a href={`/${locale}`}>{t.nav[0]}</a>
              <a href={`/${locale}/projects`}>{t.nav[1]}</a>
              <a href={`/${locale}/craft`}>{t.nav[2]}</a>
              <a href={`/${locale}/notes`}>{locale === 'en' ? 'Notes' : 'Ghi chú'}</a>
              <a href={`/${locale}/about`}>{locale === 'en' ? 'About' : 'Giới thiệu'}</a>
              <a href={`/${locale}/contact`}>{locale === 'en' ? 'Contact' : 'Liên hệ'}</a>
            </nav>
            <DemoLanguageSwitch locale={locale} />
          </div>
        </header>
        <main id="content">{children}</main>
        <footer className="demo-footer">
          <div className="demo-container">
            <BrandMark className="demo-brand-logo" />
            <span>{t.footer}</span>
            <span>© 2026 lil.parker</span>
          </div>
        </footer>
      </div>
    </DemoModeProvider>
  );
}

function Monogram() {
  return (
    <svg className="demo-monogram" viewBox="0 0 320 320" fill="none" aria-hidden="true">
      <circle cx="160" cy="160" r="145" className="demo-monogram-ring" />
      <path
        className="demo-monogram-path"
        d="M92 75v145c0 15 9 24 23 24h25M160 75v169M160 151c0-25 16-41 40-41 26 0 43 18 43 47v31c0 27-17 45-43 45-24 0-40-16-40-41M258 239h2"
        stroke="currentColor"
        strokeWidth="11"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function DemoHome({ locale }: { locale: Locale }) {
  const t = demoCopy[locale].home;
  const projects = demoProjects(locale);
  return (
    <>
      <section className="demo-hero">
        <div className="demo-hero-glow" aria-hidden />
        <div className="demo-container demo-hero-grid">
          <div className="demo-hero-copy">
            <p className="demo-eyebrow">
              <span className="demo-status-dot" />
              {t.eyebrow}
            </p>
            <h1>{t.title}</h1>
            <p className="demo-intro">{t.intro}</p>
            <div className="demo-actions">
              <a className="demo-button demo-button-primary" href={`/${locale}/projects`}>
                {t.work}
                <ArrowRight size={17} aria-hidden />
              </a>
              <a className="demo-button demo-button-outline" href={`/${locale}/craft`}>
                {t.craft}
              </a>
            </div>
            <div className="demo-hero-footnote">
              <span>01 / 03</span>
              <span>
                {locale === 'en' ? 'SCROLL TO EXPLORE' : 'CUỘN ĐỂ KHÁM PHÁ'}{' '}
                <ArrowDownRight size={15} aria-hidden />
              </span>
            </div>
          </div>
          <div className="demo-hero-art">
            <div className="demo-art-grid" aria-hidden />
            <div className="demo-art-orbit" aria-hidden />
            <Monogram />
            <span className="demo-art-caption">
              {locale === 'en' ? 'FORM FOLLOWS FEELING' : 'HÌNH THỨC THEO CẢM NHẬN'} · 2026
            </span>
          </div>
        </div>
      </section>
      <section className="demo-section demo-container">
        <div className="demo-section-heading">
          <div>
            <p className="demo-eyebrow">
              01 / {locale === 'en' ? 'SELECTED WORK' : 'DỰ ÁN NỔI BẬT'}
            </p>
            <h2>{t.selected}</h2>
            <p>{t.selectedIntro}</p>
          </div>
          <a href={`/${locale}/projects`} className="demo-text-link">
            {t.work}
            <ArrowRight size={16} aria-hidden />
          </a>
        </div>
        <div className="demo-card-grid demo-home-grid">
          {projects.slice(0, 3).map((project) => (
            <DemoSpotlightCard key={project.slug} project={project} locale={locale} />
          ))}
        </div>
      </section>
      <section className="demo-approach">
        <div className="demo-container demo-approach-inner">
          <div className="demo-asterisk">
            <Asterisk size={58} strokeWidth={1} aria-hidden />
          </div>
          <div>
            <p className="demo-eyebrow">
              02 / {locale === 'en' ? 'THE APPROACH' : 'CÁCH TIẾP CẬN'}
            </p>
            <h2>{t.approach}</h2>
            <p>{t.approachIntro}</p>
          </div>
          <a className="demo-button demo-button-outline" href={`/${locale}/craft`}>
            {t.craft}
            <ArrowRight size={17} aria-hidden />
          </a>
        </div>
      </section>
    </>
  );
}

export function DemoProjects({ locale }: { locale: Locale }) {
  const t = demoCopy[locale].projects;
  const projects = demoProjects(locale);
  return (
    <div className="demo-container demo-projects-page">
      <div className="demo-page-intro">
        <p className="demo-eyebrow">{t.eyebrow}</p>
        <h1>{t.title}</h1>
        <p>{t.intro}</p>
      </div>
      <div className="demo-projects-bar">
        <span className="demo-filter-current">
          {t.all} <span>{String(projects.length).padStart(2, '0')}</span>
        </span>
        <span>↳ 01 — {String(projects.length).padStart(2, '0')}</span>
      </div>
      <div className="demo-card-grid">
        <div className="demo-featured">
          <p className="demo-card-eyebrow">{t.featured}</p>
          <DemoSpotlightCard project={projects[0]!} locale={locale} />
        </div>
        {projects.slice(1).map((project) => (
          <DemoSpotlightCard key={project.slug} project={project} locale={locale} />
        ))}
      </div>
    </div>
  );
}

export function DemoDetail({ locale, slug }: { locale: Locale; slug: string }) {
  const t = demoCopy[locale].detail;
  const projects = demoProjects(locale);
  const project = projects.find((item) => item.slug === slug);
  if (!project) return null;
  const next = projects[(projects.findIndex((item) => item.slug === slug) + 1) % projects.length]!;
  const sections = [
    { id: 'context', title: t.context },
    { id: 'approach', title: t.approach },
    { id: 'outcome', title: t.outcome },
  ];
  return (
    <article className="demo-container demo-detail">
      <a className="demo-back" href={`/${locale}/projects`}>
        ← {t.back}
      </a>
      <div className="demo-detail-header">
        <p className="demo-eyebrow">
          {locale === 'en' ? 'CASE STUDY' : 'CÂU CHUYỆN DỰ ÁN'} / 0{project.id}
        </p>
        <h1 style={{ viewTransitionName: `title-${slug}` }}>{project.title}</h1>
        <p>{project.tagline}</p>
      </div>
      <div className="demo-detail-meta">
        <div>
          <span>{t.role}</span>
          <strong>{project.role}</strong>
        </div>
        <div>
          <span>{t.timeline}</span>
          <strong>
            {project.startDate.slice(0, 4)} — {locale === 'en' ? 'Present' : 'Hiện tại'}
          </strong>
        </div>
        <div>
          <span>{t.stack}</span>
          <strong>{project.skills.map((skill) => skill.name).join(' · ')}</strong>
        </div>
      </div>
      <div className="demo-detail-cover">
        <img
          src={`/mock/covers/${slug}.svg`}
          alt=""
          width="1600"
          height="1000"
          style={{ viewTransitionName: `cover-${slug}` }}
        />
      </div>
      <div className="demo-detail-columns">
        <aside className="demo-toc">
          <p>{t.toc}</p>
          <nav aria-label={t.toc}>
            {sections.map((section, index) => (
              <a key={section.id} href={`#${section.id}`}>
                <span>0{index + 1}</span>
                {section.title}
              </a>
            ))}
          </nav>
        </aside>
        <div className="demo-story">
          <div className="demo-tldr">
            <span className="demo-eyebrow">{t.summary}</span>
            <p>
              {project.tagline} {project.result}
            </p>
          </div>
          <section id="context">
            <p className="demo-eyebrow">01 / {t.context}</p>
            <h2>
              {locale === 'en'
                ? 'Make the intricate feel intuitive.'
                : 'Biến điều phức tạp thành trực quan.'}
            </h2>
            <p>
              {locale === 'en'
                ? 'This sample case study explores how a dense product workflow can be shaped into a clear, confident experience. The design begins with the decisions people need to make, then works backward to the information that supports them.'
                : 'Nghiên cứu mẫu này khám phá cách biến quy trình sản phẩm dày đặc thành trải nghiệm rõ ràng, tự tin. Thiết kế bắt đầu từ quyết định của người dùng rồi xác định thông tin hỗ trợ.'}
            </p>
          </section>
          <section id="approach">
            <p className="demo-eyebrow">02 / {t.approach}</p>
            <h2>
              {locale === 'en'
                ? 'A system that gives every detail room.'
                : 'Một hệ thống có chỗ cho từng chi tiết.'}
            </h2>
            <p>
              {locale === 'en'
                ? 'A consistent grid, deliberate hierarchy, and restrained color help users scan, compare, and act. Components repeat in a predictable rhythm so the interface stays calm as content grows.'
                : 'Lưới nhất quán, thứ bậc rõ và màu sắc tiết chế giúp người dùng quét, so sánh và hành động. Thành phần lặp lại có nhịp điệu để giao diện luôn gọn khi nội dung tăng.'}
            </p>
            <div className="demo-process">
              <span>
                01 <strong>{locale === 'en' ? 'DISCOVER' : 'KHÁM PHÁ'}</strong>
              </span>
              <span>
                02 <strong>{locale === 'en' ? 'STRUCTURE' : 'CẤU TRÚC'}</strong>
              </span>
              <span>
                03 <strong>{locale === 'en' ? 'REFINE' : 'TINH CHỈNH'}</strong>
              </span>
            </div>
          </section>
          <section id="outcome">
            <p className="demo-eyebrow">03 / {t.outcome}</p>
            <h2>
              {locale === 'en'
                ? 'Clarity is a design choice.'
                : 'Sự rõ ràng là một lựa chọn thiết kế.'}
            </h2>
            <p>
              {project.result}{' '}
              {locale === 'en'
                ? 'This is placeholder narrative for the local visual demo; final outcomes belong to the API content.'
                : 'Đây là nội dung mẫu cho bản thử nghiệm trực quan; kết quả cuối cùng lấy từ API.'}
            </p>
          </section>
        </div>
      </div>
      <a className="demo-next" href={`/${locale}/projects/${next.slug}`}>
        <span>{t.next}</span>
        <strong>{next.title}</strong>
        <ArrowRight size={28} aria-hidden />
      </a>
    </article>
  );
}

export function DemoCraft({ locale }: { locale: Locale }) {
  const t = demoCopy[locale].craft;
  return (
    <div className="demo-container demo-craft">
      <div className="demo-page-intro">
        <p className="demo-eyebrow">{t.eyebrow}</p>
        <h1>{t.title}</h1>
        <p>{t.intro}</p>
      </div>
      <div className="demo-craft-grid">
        <article className="demo-experiment demo-experiment-orbit">
          <div className="demo-experiment-stage">
            <span className="demo-orbit-center" />
            <span className="demo-orbit-path demo-orbit-path-one" />
            <span className="demo-orbit-path demo-orbit-path-two" />
          </div>
          <div className="demo-experiment-caption">
            <span>01 / {locale === 'en' ? 'MOTION' : 'CHUYỂN ĐỘNG'}</span>
            <h2>{t.one}</h2>
            <p>{t.oneText}</p>
          </div>
        </article>
        <article className="demo-experiment demo-experiment-signal">
          <div className="demo-experiment-stage">
            <div className="demo-signal" />
            <span className="demo-signal-cross">+</span>
          </div>
          <div className="demo-experiment-caption">
            <span>02 / {locale === 'en' ? 'COLOR' : 'MÀU SẮC'}</span>
            <h2>{t.two}</h2>
            <p>{t.twoText}</p>
          </div>
        </article>
        <article className="demo-experiment demo-experiment-type">
          <div className="demo-experiment-stage">
            <div>
              {locale === 'en' ? 'Make' : 'Dành'}
              <br />
              <em>{locale === 'en' ? 'space' : 'chỗ'}</em>
              <br />
              {locale === 'en' ? 'for ideas.' : 'cho ý tưởng.'}
            </div>
          </div>
          <div className="demo-experiment-caption">
            <span>03 / {locale === 'en' ? 'TYPE' : 'CHỮ'}</span>
            <h2>{t.three}</h2>
            <p>{t.threeText}</p>
          </div>
        </article>
        <article className="demo-experiment demo-experiment-material">
          <div className="demo-experiment-stage">
            <div className="demo-material-square">
              <Asterisk size={65} strokeWidth={1} aria-hidden />
            </div>
          </div>
          <div className="demo-experiment-caption">
            <span>04 / {locale === 'en' ? 'RESPONSE' : 'PHẢN HỒI'}</span>
            <h2>{t.four}</h2>
            <p>{t.fourText}</p>
          </div>
        </article>
      </div>
    </div>
  );
}
