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
    <footer className="border-t">
      <div className="text-meta mx-auto flex max-w-5xl flex-wrap items-center gap-x-4 gap-y-2 px-6 py-6 font-mono">
        <span>{name}</span>
        {nav.map((item) => (
          <Link
            key={item.id}
            href={item.href}
            className="hover:text-foreground text-muted-foreground"
          >
            {item.label}
          </Link>
        ))}
        {social.map((link) => (
          <a
            key={link.id}
            href={link.url}
            rel="noreferrer"
            className="hover:text-foreground text-muted-foreground"
          >
            {link.label}
          </a>
        ))}
        {sha ? <span className="text-muted-foreground">{sha}</span> : null}
      </div>
    </footer>
  );
}
