import { Skeleton } from '@portfolio/ui/components/ui/skeleton';
import type { Meta, StoryObj } from '@storybook/react';

import { SectionBoundary } from './SectionBoundary';

const LABELS = { error: 'Could not load this section', retry: 'Retry', empty: 'Nothing here yet' };

const meta = {
  title: 'States/SectionBoundary',
  component: SectionBoundary,
} satisfies Meta<typeof SectionBoundary>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Loading: Story = {
  args: {
    labels: LABELS,
    fallback: <Skeleton className="h-24 w-full" />,
    children: <Skeleton className="h-24 w-full" />,
  },
  render: () => (
    <SectionBoundary labels={LABELS} fallback={<Skeleton className="h-24 w-full" />}>
      <Skeleton className="h-24 w-full" />
    </SectionBoundary>
  ),
};

export const Empty: Story = {
  args: { labels: LABELS, fallback: null, isEmpty: true, children: null },
};

export const Failed: Story = {
  args: { labels: LABELS, fallback: null, requestId: 'req-demo', children: null },
  render: () => {
    function Boom(): null {
      throw new globalThis.Error('boom');
    }
    return (
      <SectionBoundary labels={LABELS} fallback={null} requestId="req-demo">
        <Boom />
      </SectionBoundary>
    );
  },
};
