import { principleFixtures } from '@portfolio/contracts';
import type { Meta, StoryObj } from '@storybook/react';

import { FeatureCard } from './FeatureCard';

const meta = {
  title: 'Sections/FeatureCard',
  component: FeatureCard,
} satisfies Meta<typeof FeatureCard>;

export default meta;
type Story = StoryObj<typeof meta>;

const sample = principleFixtures[0]!;

export const Default: Story = {
  args: {
    title: sample.title,
    body: sample.body,
    iconKey: sample.iconKey,
  },
};

export const Grid: Story = {
  args: {
    title: sample.title,
    body: sample.body,
    iconKey: sample.iconKey,
  },
  render: () => (
    <div className="grid gap-3 sm:grid-cols-2">
      {principleFixtures.map((principle) => (
        <FeatureCard
          key={principle.id}
          title={principle.title}
          body={principle.body}
          iconKey={principle.iconKey}
        />
      ))}
    </div>
  ),
};
