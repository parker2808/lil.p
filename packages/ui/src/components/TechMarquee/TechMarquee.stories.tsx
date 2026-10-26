import { skillChipFixtures } from '@portfolio/contracts';
import type { Meta, StoryObj } from '@storybook/react';

import { TechMarquee } from './TechMarquee';

const meta = {
  title: 'Sections/TechMarquee',
  component: TechMarquee,
  args: {
    labels: { pause: 'Pause marquee', play: 'Play marquee' },
  },
} satisfies Meta<typeof TechMarquee>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Animated: Story = {
  args: { items: skillChipFixtures },
};

export const Static: Story = {
  args: { items: skillChipFixtures.slice(0, 4) },
};
