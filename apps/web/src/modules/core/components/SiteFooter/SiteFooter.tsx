import type { PublicNavItem, PublicSocialLink } from '@portfolio/contracts';
import { getLocale, getTranslations } from 'next-intl/server';

import { Link } from '@i18n/navigation';
import { Button } from '@portfolio/ui/components/ui/button';
import { Kbd } from '@portfolio/ui/components/ui/kbd';

import { footerSitemap } from '../../utils/footer-sitemap.util';
import { LocaleSwitch } from '../LocaleSwitch/LocaleSwitch';

export async function SiteFooter({
  name,
  nav,
  social,
  updatedAt,
  buildSha,
}: {
  name: string;
  nav: { header: PublicNavItem[]; footer: PublicNavItem[] };
  social: PublicSocialLink[];
  updatedAt: Date;
  buildSha?: string;
}) {
  const t = await getTranslations('footer');
  const locale = await getLocale();
  const sha = buildSha?.slice(0, 7);
  const updatedLabel = new Intl.DateTimeFormat(locale, {
    dateStyle: 'long',
    timeZone: 'UTC',
  }).format(updatedAt);

  return (
    <footer className="site-footer border-t">
      <div className="site-container footer-grid mx-auto">
        <div className="footer-cta">
          <h2 className="footer-cta-title">{t('ctaTitle')}</h2>
          <Button surface="public" asChild>
            <Link href="/contact">{t('ctaAction')}</Link>
          </Button>
        </div>
        <nav aria-labelledby="footer-sitemap" className="footer-column">
          <h2 id="footer-sitemap" className="footer-heading">
            {t('sitemap')}
          </h2>
          <ul>
            {footerSitemap(nav.header, nav.footer).map((item) => (
              <li key={item.id}>
                <Link href={item.href} className="tap hover:text-foreground text-muted-foreground">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <div className="footer-column">
          <h2 className="footer-heading">{t('social')}</h2>
          {social.length ? (
            <ul>
              {social.map((link) => (
                <li key={link.id}>
                  <a
                    href={link.url}
                    rel="noreferrer"
                    className="tap hover:text-foreground text-muted-foreground"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          ) : null}
          <p className="footer-hint text-muted-foreground">
            {t.rich('searchHint', { kbd: (chunks) => <Kbd>{chunks}</Kbd> })}
          </p>
        </div>
      </div>
      <div className="site-container footer-bottom text-meta text-muted-foreground mx-auto font-mono">
        <p>
          {t.rich('lastUpdated', {
            date: updatedLabel,
            time: (chunks) => <time dateTime={updatedAt.toISOString()}>{chunks}</time>,
          })}
        </p>
        {sha ? <span>{sha}</span> : null}
        <LocaleSwitch label={t('locale')} />
      </div>
      <div className="site-container footer-wordmark" aria-hidden>
        {name}
      </div>
    </footer>
  );
}
