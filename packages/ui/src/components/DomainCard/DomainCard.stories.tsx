import { domainFixture, domainFixtures } from '@portfolio/contracts';
import type { Meta, StoryObj } from '@storybook/react';

import { DomainCard } from './DomainCard';

const meta = {
  title: 'Cards/DomainCard',
  component: DomainCard,
  args: {
    href: '/projects?domain=sample-domain',
    labels: { projects: 'projects' },
  },
} satisfies Meta<typeof DomainCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { domain: domainFixture },
};

export const Set: Story = {
  args: { domain: domainFixture },
  render: (args) => (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {domainFixtures.map((domain) => (
        <DomainCard
          key={domain.id}
          {...args}
          domain={domain}
          href={`/projects?domain=${domain.slug}`}
        />
      ))}
    </div>
  ),
};
