import type { Meta, StoryObj } from '@storybook/react';

import { Field, FieldError, FieldLabel } from './field';
import { Input } from './input';
import { Textarea } from './textarea';

const meta = {
  title: 'Primitives/Field',
  component: Input,
} satisfies Meta<typeof Input>;

export default meta;
type Story = StoryObj<typeof meta>;

export const States: Story = {
  render: () => (
    <div className="flex max-w-sm flex-col gap-6">
      <Field>
        <FieldLabel htmlFor="default">Default</FieldLabel>
        <Input id="default" defaultValue="Parker" />
      </Field>
      <Field>
        <FieldLabel htmlFor="focus">Focus</FieldLabel>
        <Input id="focus" defaultValue="Focused" autoFocus />
      </Field>
      <Field>
        <FieldLabel htmlFor="error">Error</FieldLabel>
        <Input id="error" defaultValue="bad" aria-invalid aria-describedby="error-msg" />
        <FieldError id="error-msg">Required</FieldError>
      </Field>
      <Field>
        <FieldLabel htmlFor="disabled">Disabled</FieldLabel>
        <Input id="disabled" defaultValue="Locked" disabled />
      </Field>
      <Field>
        <FieldLabel htmlFor="notes">Textarea</FieldLabel>
        <Textarea id="notes" defaultValue="A longer note." />
      </Field>
    </div>
  ),
};
