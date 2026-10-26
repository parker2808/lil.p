import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { CodeBlock } from './CodeBlock';

const labels = { copy: 'Copy', copied: 'Copied', wrap: 'Wrap' };

describe('CodeBlock', () => {
  it('is keyboard-scrollable and announces copy', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: { writeText },
    });

    render(
      <CodeBlock
        code="export const answer = 42;"
        language="ts"
        filename="answer.ts"
        labels={labels}
      >
        <code>export const answer = 42;</code>
      </CodeBlock>,
    );

    expect(screen.getByText('answer.ts')).toBeInTheDocument();
    const scroll = screen.getByText('export const answer = 42;').closest('[tabindex="0"]');
    expect(scroll).toHaveAttribute('tabindex', '0');

    fireEvent.click(screen.getByRole('button', { name: 'Copy' }));
    expect(writeText).toHaveBeenCalledWith('export const answer = 42;');
    expect(await screen.findAllByText('Copied')).not.toHaveLength(0);
  });
});
