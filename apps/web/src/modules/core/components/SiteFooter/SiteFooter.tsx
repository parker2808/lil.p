import type { PublicNavItem, PublicSocialLink } from '@portfolio/contracts';

import { Link } from '@i18n/navigation';

export function SiteFooter({
  name,
  nav,
  social,
  buildSha,
}: {
  name: string;
  nav: PublicNavItem[];
  social: PublicSocialLink[];
  buildSha?: string;
}) {
  const sha = buildSha?.slice(0, 7);

  return (
    <footer className="site-footer border-t">
      <div className="site-container text-meta mx-auto flex flex-wrap items-center gap-x-6 gap-y-4 py-10 font-mono">
        <span>{name}</span>
        {nav.map((item) => (
          <Link
            key={item.id}
            href={item.href}
            className="tap hover:text-foreground text-muted-foreground"
          >
            {item.label}
          </Link>
        ))}
        {social.map((link) => (
          <a
            key={link.id}
            href={link.url}
            rel="noreferrer"
            className="tap hover:text-foreground text-muted-foreground"
          >
            {link.label}
          </a>
        ))}
        {sha ? <span className="text-muted-foreground">{sha}</span> : null}
      </div>
      <div className="site-container footer-wordmark" aria-hidden>
        {name}
      </div>
    </footer>
  );
}
