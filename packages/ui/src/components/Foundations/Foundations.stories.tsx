import { PageSkeleton } from '@portfolio/ui/components/PageSkeleton/PageSkeleton';
import { Button } from '@portfolio/ui/components/ui/button';
import type { Meta, StoryObj } from '@storybook/react';

function Foundations({ admin = false }: { admin?: boolean }) {
  return (
    <div
      className={
        admin ? 'admin bg-background text-foreground p-8' : 'bg-background text-foreground p-8'
      }
    >
      <h1 className="text-title">Ink & Signal</h1>
      <p className="font-mono text-sm">IBM Plex · Ở · Ẫ · Ữ</p>
      <div className="my-8 grid grid-cols-3 gap-4">
        {['background', 'card', 'primary', 'muted', 'accent', 'foreground'].map((token) => (
          <div key={token}>
            <div className="h-20 rounded-xl border" style={{ background: `var(--${token})` }} />
            <p className="font-mono text-xs">{token}</p>
          </div>
        ))}
      </div>
      <div className="flex gap-3">
        <Button>Publish</Button>
        <Button variant="outline">Preview</Button>
        <Button loading>Saving</Button>
      </div>
      <PageSkeleton variant="admin" />
    </div>
  );
}
const meta = { title: 'Foundations/Redesign', component: Foundations } satisfies Meta<
  typeof Foundations
>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Public: Story = {};
export const Admin: Story = { args: { admin: true } };
