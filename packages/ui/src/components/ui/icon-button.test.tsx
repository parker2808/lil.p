import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';

import { IconButton, type IconButtonProps } from './icon-button';
import { TooltipProvider } from './tooltip';

describe('IconButton', () => {
  it('renders the required label as aria-label and shows it in a tooltip', async () => {
    const user = userEvent.setup();
    render(
      <TooltipProvider delayDuration={0}>
        <IconButton label="Delete project">
          <span data-testid="icon" />
        </IconButton>
      </TooltipProvider>,
    );

    const button = screen.getByRole('button', { name: 'Delete project' });
    expect(button).toHaveAttribute('aria-label', 'Delete project');
    expect(screen.getByTestId('icon')).toBeInTheDocument();
    expect(button).toHaveClass('size-8');

    await user.tab();

    await waitFor(() => {
      expect(screen.getByText('Delete project')).toBeInTheDocument();
    });
  });

  it('requires the label prop at type level', () => {
    // @ts-expect-error - `label` is required on IconButton
    const withoutLabel: IconButtonProps = {};
    expect(withoutLabel).toEqual({});
  });
});
