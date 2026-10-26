import type { RenderLink } from '@portfolio/ui/utils/render-link.util';

import { Link } from '@i18n/navigation';

export const renderAppLink: RenderLink = ({ href, className, children }) => (
  <Link href={href} className={className}>
    {children}
  </Link>
);
