import type { Locale } from '@parker2808/cms-core/contracts';
import { lazy, Suspense, useEffect, useState } from 'react';

import { copy, sampleBlocks } from './content';
import { PageBlocks } from './render';

const Editor = lazy(() =>
  import('./Editor').then(({ Editor: Component }) => ({ default: Component })),
);

type Route = 'home' | 'components' | 'editor' | 'unknown' | 'not-found';

export function routeFor(pathname: string): { locale: Locale; route: Route } {
  const [, language, segment, ...extra] = pathname.split('/');
  const locale: Locale = language === 'vi' ? 'vi' : 'en';
  if (!['en', 'vi'].includes(language) || extra.some(Boolean))
    return { locale, route: 'not-found' };
  if (!segment) return { locale, route: 'home' };
  if (segment === 'components' || segment === 'editor' || segment === 'unknown')
    return { locale, route: segment };
  return { locale, route: 'not-found' };
}

export function App({ pathname = window.location.pathname }: { pathname?: string }) {
  const { locale, route } = routeFor(pathname);
  const words = copy[locale];
  const [mode, setMode] = useState<'light' | 'dark'>(() =>
    new URLSearchParams(window.location.search).get('mode') === 'dark' ? 'dark' : 'light',
  );
  const [brand, setBrand] = useState(
    () => new URLSearchParams(window.location.search).get('brand') === 'lilp',
  );

  useEffect(() => {
    document.documentElement.lang = locale;
    document.documentElement.dataset.theme = mode;
    document.documentElement.dataset.brand = brand ? 'lilp' : 'neutral';
    document.title = `${route === 'not-found' ? words.notFound : route === 'home' ? words.home : words[route]} · ${words.name}`;
  }, [brand, locale, mode, route, words]);

  return (
    <div className="fixture-shell">
      <header className="fixture-topbar">
        <a
          className="fixture-logo"
          href={`/${locale}/`}
          aria-label={`${words.name} · ${words.home}`}
        >
          <span aria-hidden="true" className="fixture-mark">
            ◇
          </span>
          <span>{words.name}</span>
        </a>
        <nav aria-label={words.name} className="fixture-nav">
          {(['home', 'components', 'editor', 'unknown'] as const).map((name) => (
            <a
              key={name}
              href={`/${locale}/${name === 'home' ? '' : name}`}
              aria-current={name === route ? 'page' : undefined}
            >
              {words[name]}
            </a>
          ))}
        </nav>
        <div className="fixture-preferences">
          <label>
            {words.locale}
            <select
              aria-label={words.locale}
              value={locale}
              onChange={(event) => {
                window.location.href = `/${event.target.value}/${route === 'home' || route === 'not-found' ? '' : route}${window.location.search}`;
              }}
            >
              <option value="en">EN</option>
              <option value="vi">VI</option>
            </select>
          </label>
          <label>
            {words.theme}
            <select
              aria-label={words.theme}
              value={mode}
              onChange={(event) => setMode(event.target.value as 'light' | 'dark')}
            >
              <option value="light">{words.light}</option>
              <option value="dark">{words.dark}</option>
            </select>
          </label>
          <label className="fixture-brand-toggle">
            <input
              type="checkbox"
              checked={brand}
              onChange={(event) => setBrand(event.target.checked)}
            />
            {words.brand}
          </label>
        </div>
      </header>
      <main className="fixture-main">
        {route === 'not-found' ? (
          <section className="fixture-intro">
            <p className="fixture-overline">404</p>
            <h1>{words.notFound}</h1>
            <a href={`/${locale}/`}>{words.back}</a>
          </section>
        ) : (
          <>
            <section className="fixture-intro">
              <p className="fixture-overline">
                {words.eyebrow} <span aria-hidden="true">/</span> {words[route]}
              </p>
              {route !== 'home' && (
                <>
                  <h1>
                    {route === 'components'
                      ? words.galleryTitle
                      : route === 'editor'
                        ? words.editorTitle
                        : words.unknownTitle}
                  </h1>
                  <p>
                    {route === 'components'
                      ? words.galleryBody
                      : route === 'editor'
                        ? words.editorBody
                        : words.unknownBody}
                  </p>
                </>
              )}
            </section>
            {route === 'home' && (
              <section className="fixture-surface" aria-label={words.home}>
                <PageBlocks blocks={sampleBlocks(locale)} locale={locale} />
              </section>
            )}
            {route === 'components' && <Gallery locale={locale} />}
            {route === 'editor' && (
              <Suspense fallback={<p role="status">{words.empty}</p>}>
                <Editor locale={locale} />
              </Suspense>
            )}
            {route === 'unknown' && <Unknown locale={locale} />}
          </>
        )}
      </main>
      <footer className="fixture-footer">
        <span>{words.eyebrow}</span>
        <span>{words.noSave}</span>
      </footer>
    </div>
  );
}

function Gallery({ locale }: { locale: Locale }) {
  const words = copy[locale];
  const blocks = sampleBlocks(locale);
  return (
    <div className="fixture-gallery">
      {blocks.map((item) => (
        <section
          className="fixture-panel fixture-gallery-card"
          key={item.key}
          aria-label={words[item.type as keyof typeof words]}
        >
          <div className="fixture-card-head">
            <span>{words[item.type as keyof typeof words]}</span>
            <code>{item.type} / v1</code>
          </div>
          <PageBlocks blocks={[item]} locale={locale} />
        </section>
      ))}
      <section className="fixture-panel fixture-gallery-card" aria-label={words.focused}>
        <div className="fixture-card-head">
          <span>{words.focused}</span>
          <code>:focus-visible</code>
        </div>
        <button type="button">{words.retry}</button>
      </section>
      <section className="fixture-panel fixture-gallery-card" aria-label={words.disabled}>
        <div className="fixture-card-head">
          <span>{words.disabled}</span>
          <code>disabled</code>
        </div>
        <button type="button" disabled>
          {words.add}
        </button>
      </section>
      <section className="fixture-panel fixture-gallery-card" aria-label={words.invalid}>
        <div className="fixture-card-head">
          <span>{words.invalid}</span>
          <code>error</code>
        </div>
        <label>
          {words.paragraph}
          <input aria-invalid="true" aria-describedby="gallery-error" />
        </label>
        <p id="gallery-error" role="alert" className="fixture-error">
          {words.validation}
        </p>
      </section>
      <section className="fixture-panel fixture-gallery-card" aria-label={words.longText}>
        <div className="fixture-card-head">
          <span>{words.longText}</span>
          <code>long</code>
        </div>
        <p>{words.longText}</p>
      </section>
      <section className="fixture-panel fixture-gallery-card" aria-label={words.unknownBlock}>
        <div className="fixture-card-head">
          <span>{words.unknownBlock}</span>
          <code>draft only</code>
        </div>
        <PageBlocks blocks={[{ ...blocks[1], type: 'not-installed' }]} locale={locale} draft />
      </section>
    </div>
  );
}

function Unknown({ locale }: { locale: Locale }) {
  const words = copy[locale];
  const unknown = {
    ...sampleBlocks(locale)[1],
    type: 'not-installed',
    props: { opaque: { future: true } },
  };
  return (
    <div className="fixture-gallery">
      <section className="fixture-panel" aria-label={words.source}>
        <h2>{words.source}</h2>
        <pre data-testid="source-snapshot">{JSON.stringify(unknown, null, 2)}</pre>
      </section>
      <section className="fixture-panel" aria-label={words.preview}>
        <h2>{words.preview}</h2>
        <PageBlocks blocks={[unknown]} locale={locale} draft />
      </section>
      <section className="fixture-panel" aria-label={words.home}>
        <h2>{words.home}</h2>
        <PageBlocks blocks={[unknown]} locale={locale} />
        <p>{words.unsupported}</p>
      </section>
    </div>
  );
}
