import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import userEvent from '@testing-library/user-event';
import { OtpInput } from '../components/student/OtpInput';

describe('OtpInput', () => {
  it('renders OTP inputs correctly', () => {
    const handleComplete = vi.fn();
    render(
      <OtpInput
        length={6}
        onComplete={handleComplete}
      />
    );

    const inputs = screen.getAllByRole('textbox');
    expect(inputs).toHaveLength(6);
  });

  it('allows typing digits and moves focus', async () => {
    const handleComplete = vi.fn();
    render(
      <OtpInput
        length={6}
        onComplete={handleComplete}
      />
    );

    const inputs = screen.getAllByRole('textbox');
    const user = userEvent.setup();

    await user.type(inputs[0], '1');
    expect(inputs[0]).toHaveValue('1');
    expect(document.activeElement).toBe(inputs[1]);

    await user.type(inputs[1], '2');
    expect(inputs[1]).toHaveValue('2');
    expect(document.activeElement).toBe(inputs[2]);
  });

  it('handles backspace navigation', async () => {
    const handleComplete = vi.fn();
    render(
      <OtpInput
        length={6}
        onComplete={handleComplete}
      />
    );

    const inputs = screen.getAllByRole('textbox');
    const user = userEvent.setup();

    // Type 1 in first input
    await user.type(inputs[0], '1');
    expect(document.activeElement).toBe(inputs[1]);

    // Press backspace on empty second input
    await user.keyboard('{Backspace}');
    expect(document.activeElement).toBe(inputs[0]);
  });
});
