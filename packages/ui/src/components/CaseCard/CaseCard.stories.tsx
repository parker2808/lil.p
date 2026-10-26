import {
  confidentialProjectFixture,
  overflowProjectFixture,
  projectFixture,
} from '@portfolio/contracts';
import type { Meta, StoryObj } from '@storybook/react';

import { CaseCard } from './CaseCard';

const meta = {
  title: 'Cards/CaseCard',
  component: CaseCard,
  args: {
    href: '/projects/sample-migration',
    labels: { nda: 'NDA' },
  },
} satisfies Meta<typeof CaseCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { project: projectFixture },
};

export const Featured: Story = {
  args: { project: projectFixture, variant: 'featured' },
};

export const Nda: Story = {
  args: { project: confidentialProjectFixture },
};

export const Overflow: Story = {
  args: { project: overflowProjectFixture },
};
