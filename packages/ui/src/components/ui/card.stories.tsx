import type { Meta, StoryObj } from '@storybook/react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './card';
import { Kbd } from './kbd';
import { Separator } from './separator';
import { Skeleton } from './skeleton';
import { Spinner } from './spinner';

const meta = {
  title: 'Primitives/Surfaces',
  component: Card,
} satisfies Meta<typeof Card>;

export default meta;
type Story = StoryObj<typeof meta>;

export const CardSkeletonKbd: Story = {
  render: () => (
    <div className="flex max-w-sm flex-col gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Card</CardTitle>
          <CardDescription>Flat surface, no drop shadow.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-ui">Shortcut</p>
          <Kbd>⌘</Kbd>
          <Kbd>K</Kbd>
        </CardContent>
      </Card>
      <Separator />
      <div className="flex items-center gap-3">
        <Spinner />
        <Skeleton className="h-8 w-40" />
      </div>
    </div>
  ),
};
