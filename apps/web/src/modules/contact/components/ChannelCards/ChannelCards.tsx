import type { PublicSocialLink } from '@portfolio/contracts';
import { getTranslations } from 'next-intl/server';

import { CopyEmailButton } from '@/modules/core/components/CopyEmailButton/CopyEmailButton';

export async function ChannelCards({
  email,
  socialLinks,
}: {
  email: string;
  socialLinks: PublicSocialLink[];
}) {
  const t = await getTranslations('contact.channels');
  return (
    <ChannelCardsView
      email={email}
      socialLinks={socialLinks}
      labels={{ email: t('email'), github: t('github'), linkedin: t('linkedin') }}
    />
  );
}

export function ChannelCardsView({
  email,
  socialLinks,
  labels,
}: {
  email: string;
  socialLinks: PublicSocialLink[];
  labels: { email: string; github: string; linkedin: string };
}) {
  const github = socialLinks.find((link) => link.kind === 'GITHUB');
  const linkedin = socialLinks.find((link) => link.kind === 'LINKEDIN');

  return (
    <ul className="border-border divide-border divide-y rounded-lg border">
      <li className="flex items-center justify-between gap-3 px-4 py-3">
        <a href={`mailto:${email}`} className="tap text-ui font-medium">
          {labels.email}
        </a>
        <CopyEmailButton email={email} />
      </li>
      {github ? (
        <li className="flex items-center justify-between gap-3 px-4 py-3">
          <span className="text-ui font-medium">{labels.github}</span>
          <a href={github.url} rel="noreferrer" className="tap text-ui">
            {github.label}
          </a>
        </li>
      ) : null}
      {linkedin ? (
        <li className="flex items-center justify-between gap-3 px-4 py-3">
          <span className="text-ui font-medium">{labels.linkedin}</span>
          <a href={linkedin.url} rel="noreferrer" className="tap text-ui">
            {linkedin.label}
          </a>
        </li>
      ) : null}
    </ul>
  );
}
