import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import Input from './Input';

// ─── Rendering ────────────────────────────────────────────────────────────────

describe('Input – rendering', () => {
  it('renders an input element', () => {
    render(<Input />);
    expect(screen.getByRole('textbox')).toBeInTheDocument();
  });

  it('defaults to type="text"', () => {
    render(<Input />);
    expect(screen.getByRole('textbox')).toHaveAttribute('type', 'text');
  });

  it('renders a label when label prop is provided', () => {
    render(<Input label="Email address" />);
    expect(screen.getByText('Email address')).toBeInTheDocument();
  });

  it('associates label with input via htmlFor/id', () => {
    render(<Input label="Username" id="username" />);
    const label = screen.getByText('Username');
    expect(label).toHaveAttribute('for', 'username');
    expect(screen.getByRole('textbox')).toHaveAttribute('id', 'username');
  });

  it('auto-generates an id when none is provided and links label', () => {
    render(<Input label="Auto ID" />);
    const input = screen.getByRole('textbox');
    const label = screen.getByText('Auto ID');
    const inputId = input.getAttribute('id');
    expect(inputId).toBeTruthy();
    expect(label).toHaveAttribute('for', inputId);
  });

  it('renders helper text', () => {
    render(<Input helperText="We'll never share your email." />);
    expect(screen.getByText("We'll never share your email.")).toBeInTheDocument();
  });

  it('renders error message', () => {
    render(<Input errorMessage="This field is required." />);
    expect(screen.getByText('This field is required.')).toBeInTheDocument();
  });

  it('renders a left icon', () => {
    render(<Input leftIcon={<span data-testid="left-icon" />} />);
    expect(screen.getByTestId('left-icon')).toBeInTheDocument();
  });

  it('renders a right icon for non-password types', () => {
    render(<Input rightIcon={<span data-testid="right-icon" />} />);
    expect(screen.getByTestId('right-icon')).toBeInTheDocument();
  });
});

// ─── Input types ──────────────────────────────────────────────────────────────

describe('Input – types', () => {
  it('renders type="email"', () => {
    render(<Input type="email" />);
    expect(screen.getByRole('textbox')).toHaveAttribute('type', 'email');
  });

  it('renders type="number"', () => {
    render(<Input type="number" />);
    expect(screen.getByRole('spinbutton')).toHaveAttribute('type', 'number');
  });

  it('renders type="tel"', () => {
    render(<Input type="tel" />);
    expect(screen.getByRole('textbox')).toHaveAttribute('type', 'tel');
  });

  it('renders type="search"', () => {
    render(<Input type="search" />);
    expect(screen.getByRole('searchbox')).toHaveAttribute('type', 'search');
  });

  it('renders type="password" as password by default', () => {
    render(<Input type="password" />);
    // password inputs don't have an implicit ARIA role – query by attribute
    const input = document.querySelector('input[type="password"]');
    expect(input).toBeInTheDocument();
  });
});

// ─── Password toggle ──────────────────────────────────────────────────────────

describe('Input – password toggle', () => {
  it('shows a toggle button for password type', () => {
    render(<Input type="password" />);
    expect(screen.getByRole('button', { name: /show password/i })).toBeInTheDocument();
  });

  it('toggles input type to text when show-password is clicked', () => {
    render(<Input type="password" />);
    const toggle = screen.getByRole('button', { name: /show password/i });
    fireEvent.click(toggle);
    expect(screen.getByRole('textbox')).toHaveAttribute('type', 'text');
  });

  it('toggles back to password type on second click', () => {
    render(<Input type="password" />);
    const toggle = screen.getByRole('button', { name: /show password/i });
    fireEvent.click(toggle);
    fireEvent.click(screen.getByRole('button', { name: /hide password/i }));
    const input = document.querySelector('input[type="password"]');
    expect(input).toBeInTheDocument();
  });

  it('does not render right icon slot for password type', () => {
    render(<Input type="password" rightIcon={<span data-testid="right-icon" />} />);
    // The right icon slot is replaced by the toggle button
    expect(screen.queryByTestId('right-icon')).not.toBeInTheDocument();
  });
});

// ─── Validation states ────────────────────────────────────────────────────────

describe('Input – validation states', () => {
  it('sets aria-invalid=false by default', () => {
    render(<Input />);
    expect(screen.getByRole('textbox')).toHaveAttribute('aria-invalid', 'false');
  });

  it('sets aria-invalid=true when errorMessage is provided', () => {
    render(<Input errorMessage="Required" />);
    expect(screen.getByRole('textbox')).toHaveAttribute('aria-invalid', 'true');
  });

  it('sets aria-invalid=true when state="error"', () => {
    render(<Input state="error" />);
    expect(screen.getByRole('textbox')).toHaveAttribute('aria-invalid', 'true');
  });

  it('sets aria-invalid=false when state="success"', () => {
    render(<Input state="success" />);
    expect(screen.getByRole('textbox')).toHaveAttribute('aria-invalid', 'false');
  });

  it('applies error border class when state="error"', () => {
    render(<Input state="error" />);
    expect(screen.getByRole('textbox').className).toMatch(/border-red-400/);
  });

  it('applies success border class when state="success"', () => {
    render(<Input state="success" />);
    expect(screen.getByRole('textbox').className).toMatch(/border-accent-mint-400/);
  });

  it('error message has role="alert"', () => {
    render(<Input errorMessage="Something went wrong" />);
    expect(screen.getByRole('alert')).toHaveTextContent('Something went wrong');
  });
});

// ─── Accessibility ────────────────────────────────────────────────────────────

describe('Input – accessibility (Req 18.5)', () => {
  it('sets aria-required=true when required=true', () => {
    render(<Input required />);
    expect(screen.getByRole('textbox')).toHaveAttribute('aria-required', 'true');
  });

  it('sets aria-required=false when required=false', () => {
    render(<Input />);
    expect(screen.getByRole('textbox')).toHaveAttribute('aria-required', 'false');
  });

  it('shows a required indicator (*) in the label when required=true', () => {
    render(<Input label="Name" required />);
    expect(screen.getByText('*')).toBeInTheDocument();
  });

  it('sets aria-describedby pointing to helper text id', () => {
    render(<Input id="test-input" helperText="Helpful hint" />);
    const input = screen.getByRole('textbox');
    const describedBy = input.getAttribute('aria-describedby');
    expect(describedBy).toContain('test-input-helper');
    expect(document.getElementById('test-input-helper')).toHaveTextContent('Helpful hint');
  });

  it('sets aria-describedby pointing to error message id', () => {
    render(<Input id="test-input" errorMessage="Invalid value" />);
    const input = screen.getByRole('textbox');
    const describedBy = input.getAttribute('aria-describedby');
    expect(describedBy).toContain('test-input-error');
    expect(document.getElementById('test-input-error')).toHaveTextContent('Invalid value');
  });

  it('sets aria-describedby with both helper and error ids when both present', () => {
    render(<Input id="test-input" helperText="Hint" errorMessage="Error" />);
    const describedBy = screen.getByRole('textbox').getAttribute('aria-describedby');
    expect(describedBy).toContain('test-input-helper');
    expect(describedBy).toContain('test-input-error');
  });

  it('does not set aria-describedby when no helper or error text', () => {
    render(<Input />);
    expect(screen.getByRole('textbox')).not.toHaveAttribute('aria-describedby');
  });

  it('is focusable by default', () => {
    render(<Input />);
    const input = screen.getByRole('textbox');
    input.focus();
    expect(document.activeElement).toBe(input);
  });

  it('forwards ref to the underlying input element', () => {
    const ref = React.createRef<HTMLInputElement>();
    render(<Input ref={ref} />);
    expect(ref.current).toBeInstanceOf(HTMLInputElement);
  });
});

// ─── Disabled state ───────────────────────────────────────────────────────────

describe('Input – disabled state', () => {
  it('sets disabled attribute when disabled=true', () => {
    render(<Input disabled />);
    expect(screen.getByRole('textbox')).toBeDisabled();
  });

  it('applies cursor-not-allowed class when disabled', () => {
    render(<Input disabled />);
    expect(screen.getByRole('textbox').className).toMatch(/cursor-not-allowed/);
  });

  it('disables the password toggle button when input is disabled', () => {
    render(<Input type="password" disabled />);
    expect(screen.getByRole('button', { name: /show password/i })).toBeDisabled();
  });
});

// ─── Full-width ───────────────────────────────────────────────────────────────

describe('Input – fullWidth', () => {
  it('applies w-full class to wrapper when fullWidth=true', () => {
    const { container } = render(<Input fullWidth />);
    expect(container.firstChild).toHaveClass('w-full');
  });
});

// ─── Pass-through props ───────────────────────────────────────────────────────

describe('Input – pass-through props', () => {
  it('passes placeholder to the input', () => {
    render(<Input placeholder="Enter your name" />);
    expect(screen.getByPlaceholderText('Enter your name')).toBeInTheDocument();
  });

  it('passes value and onChange', () => {
    const onChange = vi.fn();
    render(<Input value="hello" onChange={onChange} />);
    expect(screen.getByRole('textbox')).toHaveValue('hello');
  });

  it('passes additional data attributes', () => {
    render(<Input data-testid="my-input" />);
    expect(screen.getByTestId('my-input')).toBeInTheDocument();
  });
});
