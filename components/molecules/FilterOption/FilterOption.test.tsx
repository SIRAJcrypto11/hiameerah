import React, { useState } from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CheckboxFilterOption, PriceRangeSlider } from './FilterOption';
import type { PriceRange } from './FilterOption';

// ─── CheckboxFilterOption ─────────────────────────────────────────────────────

describe('CheckboxFilterOption – rendering', () => {
  it('renders the label text', () => {
    render(<CheckboxFilterOption label="Hijab" checked={false} onChange={() => {}} />);
    expect(screen.getByTestId('checkbox-filter-label')).toHaveTextContent('Hijab');
  });

  it('renders a checkbox input', () => {
    render(<CheckboxFilterOption label="Hijab" checked={false} onChange={() => {}} />);
    expect(screen.getByTestId('checkbox-filter-input')).toBeInTheDocument();
    expect(screen.getByTestId('checkbox-filter-input')).toHaveAttribute('type', 'checkbox');
  });

  it('renders unchecked by default when checked=false', () => {
    render(<CheckboxFilterOption label="Hijab" checked={false} onChange={() => {}} />);
    expect(screen.getByTestId('checkbox-filter-input')).not.toBeChecked();
  });

  it('renders checked when checked=true', () => {
    render(<CheckboxFilterOption label="Hijab" checked={true} onChange={() => {}} />);
    expect(screen.getByTestId('checkbox-filter-input')).toBeChecked();
  });

  it('does not render count badge when count is not provided', () => {
    render(<CheckboxFilterOption label="Hijab" checked={false} onChange={() => {}} />);
    expect(screen.queryByTestId('checkbox-filter-count')).not.toBeInTheDocument();
  });

  it('renders count badge when count is provided', () => {
    render(<CheckboxFilterOption label="Hijab" checked={false} onChange={() => {}} count={12} />);
    expect(screen.getByTestId('checkbox-filter-count')).toBeInTheDocument();
    expect(screen.getByTestId('checkbox-filter-count')).toHaveTextContent('12');
  });

  it('renders count badge with zero', () => {
    render(<CheckboxFilterOption label="Hijab" checked={false} onChange={() => {}} count={0} />);
    expect(screen.getByTestId('checkbox-filter-count')).toHaveTextContent('0');
  });

  it('applies custom className to the wrapper', () => {
    render(
      <CheckboxFilterOption
        label="Hijab"
        checked={false}
        onChange={() => {}}
        className="my-class"
      />
    );
    expect(screen.getByTestId('checkbox-filter-option')).toHaveClass('my-class');
  });
});

describe('CheckboxFilterOption – active state styling', () => {
  it('applies primary color classes when checked', () => {
    render(<CheckboxFilterOption label="Hijab" checked={true} onChange={() => {}} />);
    const wrapper = screen.getByTestId('checkbox-filter-option');
    // Active state: bg-primary-50 and text-primary-700
    expect(wrapper.className).toMatch(/bg-primary-50/);
    expect(wrapper.className).toMatch(/text-primary-700/);
  });

  it('does not apply primary color classes when unchecked', () => {
    render(<CheckboxFilterOption label="Hijab" checked={false} onChange={() => {}} />);
    const wrapper = screen.getByTestId('checkbox-filter-option');
    expect(wrapper.className).not.toMatch(/bg-primary-50/);
    expect(wrapper.className).not.toMatch(/text-primary-700/);
  });

  it('checkbox input has primary border when checked', () => {
    render(<CheckboxFilterOption label="Hijab" checked={true} onChange={() => {}} />);
    const input = screen.getByTestId('checkbox-filter-input');
    expect(input.className).toMatch(/border-primary-400/);
    expect(input.className).toMatch(/bg-primary-400/);
  });

  it('checkbox input has secondary border when unchecked', () => {
    render(<CheckboxFilterOption label="Hijab" checked={false} onChange={() => {}} />);
    const input = screen.getByTestId('checkbox-filter-input');
    expect(input.className).toMatch(/border-secondary-300/);
  });
});

describe('CheckboxFilterOption – interaction', () => {
  it('calls onChange with true when unchecked checkbox is clicked', async () => {
    const onChange = vi.fn();
    render(<CheckboxFilterOption label="Hijab" checked={false} onChange={onChange} />);
    await userEvent.click(screen.getByTestId('checkbox-filter-input'));
    expect(onChange).toHaveBeenCalledOnce();
    expect(onChange).toHaveBeenCalledWith(true);
  });

  it('calls onChange with false when checked checkbox is clicked', async () => {
    const onChange = vi.fn();
    render(<CheckboxFilterOption label="Hijab" checked={true} onChange={onChange} />);
    await userEvent.click(screen.getByTestId('checkbox-filter-input'));
    expect(onChange).toHaveBeenCalledOnce();
    expect(onChange).toHaveBeenCalledWith(false);
  });

  it('calls onChange when clicking the label', async () => {
    const onChange = vi.fn();
    render(<CheckboxFilterOption label="Hijab" checked={false} onChange={onChange} />);
    await userEvent.click(screen.getByTestId('checkbox-filter-label'));
    expect(onChange).toHaveBeenCalledOnce();
  });

  it('does not call onChange when disabled', async () => {
    const onChange = vi.fn();
    render(
      <CheckboxFilterOption label="Hijab" checked={false} onChange={onChange} disabled={true} />
    );
    await userEvent.click(screen.getByTestId('checkbox-filter-input'));
    expect(onChange).not.toHaveBeenCalled();
  });
});

describe('CheckboxFilterOption – accessibility', () => {
  it('label is associated with the checkbox via htmlFor/id', () => {
    render(<CheckboxFilterOption label="Hijab" checked={false} onChange={() => {}} />);
    const input = screen.getByTestId('checkbox-filter-input');
    const label = screen.getByTestId('checkbox-filter-option');
    // The label element wraps the input, so clicking label toggles input
    expect(label.tagName).toBe('LABEL');
    expect(input).toHaveAttribute('id');
    // The label's htmlFor should match the input's id
    const inputId = input.getAttribute('id');
    expect(label).toHaveAttribute('for', inputId);
  });

  it('checkbox has aria-label with count when count is provided', () => {
    render(<CheckboxFilterOption label="Hijab" checked={false} onChange={() => {}} count={5} />);
    const input = screen.getByTestId('checkbox-filter-input');
    expect(input).toHaveAttribute('aria-label', 'Hijab (5 products)');
  });

  it('checkbox has aria-label without count when count is not provided', () => {
    render(<CheckboxFilterOption label="Hijab" checked={false} onChange={() => {}} />);
    const input = screen.getByTestId('checkbox-filter-input');
    expect(input).toHaveAttribute('aria-label', 'Hijab');
  });

  it('disabled checkbox has disabled attribute', () => {
    render(
      <CheckboxFilterOption label="Hijab" checked={false} onChange={() => {}} disabled={true} />
    );
    expect(screen.getByTestId('checkbox-filter-input')).toBeDisabled();
  });

  it('disabled wrapper has reduced opacity class', () => {
    render(
      <CheckboxFilterOption label="Hijab" checked={false} onChange={() => {}} disabled={true} />
    );
    expect(screen.getByTestId('checkbox-filter-option').className).toMatch(/opacity-50/);
  });
});

describe('CheckboxFilterOption – controlled state', () => {
  it('reflects external checked state changes', () => {
    const { rerender } = render(
      <CheckboxFilterOption label="Hijab" checked={false} onChange={() => {}} />
    );
    expect(screen.getByTestId('checkbox-filter-input')).not.toBeChecked();

    rerender(<CheckboxFilterOption label="Hijab" checked={true} onChange={() => {}} />);
    expect(screen.getByTestId('checkbox-filter-input')).toBeChecked();
  });
});

// ─── PriceRangeSlider ─────────────────────────────────────────────────────────

describe('PriceRangeSlider – rendering', () => {
  const defaultValue: PriceRange = { min: 100000, max: 500000 };

  it('renders the slider container', () => {
    render(<PriceRangeSlider value={defaultValue} onChange={() => {}} />);
    expect(screen.getByTestId('price-range-slider')).toBeInTheDocument();
  });

  it('renders the price range display', () => {
    render(<PriceRangeSlider value={defaultValue} onChange={() => {}} />);
    expect(screen.getByTestId('price-range-display')).toBeInTheDocument();
  });

  it('displays current range with Rp format', () => {
    render(<PriceRangeSlider value={defaultValue} onChange={() => {}} />);
    const display = screen.getByTestId('price-range-display');
    expect(display.textContent).toMatch(/Rp/);
    expect(display.textContent).toMatch(/100/);
    expect(display.textContent).toMatch(/500/);
  });

  it('renders min and max slider inputs', () => {
    render(<PriceRangeSlider value={defaultValue} onChange={() => {}} />);
    expect(screen.getByTestId('price-range-min-slider')).toBeInTheDocument();
    expect(screen.getByTestId('price-range-max-slider')).toBeInTheDocument();
  });

  it('renders min and max number inputs', () => {
    render(<PriceRangeSlider value={defaultValue} onChange={() => {}} />);
    expect(screen.getByTestId('price-min-input')).toBeInTheDocument();
    expect(screen.getByTestId('price-max-input')).toBeInTheDocument();
  });

  it('renders min and max labels', () => {
    render(<PriceRangeSlider value={defaultValue} onChange={() => {}} />);
    expect(screen.getByTestId('price-min-label')).toHaveTextContent('Min');
    expect(screen.getByTestId('price-max-label')).toHaveTextContent('Max');
  });

  it('renders the track fill element', () => {
    render(<PriceRangeSlider value={defaultValue} onChange={() => {}} />);
    expect(screen.getByTestId('price-range-fill')).toBeInTheDocument();
  });

  it('applies custom className to the wrapper', () => {
    render(<PriceRangeSlider value={defaultValue} onChange={() => {}} className="custom-slider" />);
    expect(screen.getByTestId('price-range-slider')).toHaveClass('custom-slider');
  });
});

describe('PriceRangeSlider – slider values', () => {
  const defaultValue: PriceRange = { min: 100000, max: 500000 };

  it('min slider reflects current min value', () => {
    render(<PriceRangeSlider value={defaultValue} onChange={() => {}} />);
    expect(screen.getByTestId('price-range-min-slider')).toHaveValue('100000');
  });

  it('max slider reflects current max value', () => {
    render(<PriceRangeSlider value={defaultValue} onChange={() => {}} />);
    expect(screen.getByTestId('price-range-max-slider')).toHaveValue('500000');
  });

  it('min number input reflects current min value', () => {
    render(<PriceRangeSlider value={defaultValue} onChange={() => {}} />);
    expect(screen.getByTestId('price-min-input')).toHaveValue(100000);
  });

  it('max number input reflects current max value', () => {
    render(<PriceRangeSlider value={defaultValue} onChange={() => {}} />);
    expect(screen.getByTestId('price-max-input')).toHaveValue(500000);
  });

  it('uses default minBound=0 and maxBound=1000000', () => {
    render(<PriceRangeSlider value={defaultValue} onChange={() => {}} />);
    const minSlider = screen.getByTestId('price-range-min-slider');
    const maxSlider = screen.getByTestId('price-range-max-slider');
    expect(minSlider).toHaveAttribute('min', '0');
    expect(minSlider).toHaveAttribute('max', '1000000');
    expect(maxSlider).toHaveAttribute('min', '0');
    expect(maxSlider).toHaveAttribute('max', '1000000');
  });

  it('uses custom minBound and maxBound', () => {
    render(
      <PriceRangeSlider
        value={{ min: 50000, max: 200000 }}
        onChange={() => {}}
        minBound={50000}
        maxBound={500000}
      />
    );
    const minSlider = screen.getByTestId('price-range-min-slider');
    expect(minSlider).toHaveAttribute('min', '50000');
    expect(minSlider).toHaveAttribute('max', '500000');
  });
});

describe('PriceRangeSlider – onChange callbacks', () => {
  it('calls onChange with new min when min slider changes', () => {
    const onChange = vi.fn();
    render(
      <PriceRangeSlider
        value={{ min: 100000, max: 500000 }}
        onChange={onChange}
        minBound={0}
        maxBound={1000000}
      />
    );
    fireEvent.change(screen.getByTestId('price-range-min-slider'), {
      target: { value: '200000' },
    });
    expect(onChange).toHaveBeenCalledOnce();
    expect(onChange).toHaveBeenCalledWith({ min: 200000, max: 500000 });
  });

  it('calls onChange with new max when max slider changes', () => {
    const onChange = vi.fn();
    render(
      <PriceRangeSlider
        value={{ min: 100000, max: 500000 }}
        onChange={onChange}
        minBound={0}
        maxBound={1000000}
      />
    );
    fireEvent.change(screen.getByTestId('price-range-max-slider'), {
      target: { value: '700000' },
    });
    expect(onChange).toHaveBeenCalledOnce();
    expect(onChange).toHaveBeenCalledWith({ min: 100000, max: 700000 });
  });

  it('calls onChange with new min when min number input changes', () => {
    const onChange = vi.fn();
    render(
      <PriceRangeSlider
        value={{ min: 100000, max: 500000 }}
        onChange={onChange}
        minBound={0}
        maxBound={1000000}
      />
    );
    fireEvent.change(screen.getByTestId('price-min-input'), { target: { value: '150000' } });
    expect(onChange).toHaveBeenCalledOnce();
    expect(onChange).toHaveBeenCalledWith({ min: 150000, max: 500000 });
  });

  it('calls onChange with new max when max number input changes', () => {
    const onChange = vi.fn();
    render(
      <PriceRangeSlider
        value={{ min: 100000, max: 500000 }}
        onChange={onChange}
        minBound={0}
        maxBound={1000000}
      />
    );
    fireEvent.change(screen.getByTestId('price-max-input'), { target: { value: '800000' } });
    expect(onChange).toHaveBeenCalledOnce();
    expect(onChange).toHaveBeenCalledWith({ min: 100000, max: 800000 });
  });
});

describe('PriceRangeSlider – clamping behavior', () => {
  it('clamps min slider to not exceed current max', () => {
    const onChange = vi.fn();
    render(
      <PriceRangeSlider
        value={{ min: 100000, max: 500000 }}
        onChange={onChange}
        minBound={0}
        maxBound={1000000}
      />
    );
    // Try to set min above max
    fireEvent.change(screen.getByTestId('price-range-min-slider'), {
      target: { value: '600000' },
    });
    expect(onChange).toHaveBeenCalledWith({ min: 500000, max: 500000 });
  });

  it('clamps max slider to not go below current min', () => {
    const onChange = vi.fn();
    render(
      <PriceRangeSlider
        value={{ min: 300000, max: 500000 }}
        onChange={onChange}
        minBound={0}
        maxBound={1000000}
      />
    );
    // Try to set max below min
    fireEvent.change(screen.getByTestId('price-range-max-slider'), {
      target: { value: '200000' },
    });
    expect(onChange).toHaveBeenCalledWith({ min: 300000, max: 300000 });
  });

  it('clamps min number input to not exceed max', () => {
    const onChange = vi.fn();
    render(
      <PriceRangeSlider
        value={{ min: 100000, max: 500000 }}
        onChange={onChange}
        minBound={0}
        maxBound={1000000}
      />
    );
    fireEvent.change(screen.getByTestId('price-min-input'), { target: { value: '700000' } });
    expect(onChange).toHaveBeenCalledWith({ min: 500000, max: 500000 });
  });

  it('clamps max number input to not go below min', () => {
    const onChange = vi.fn();
    render(
      <PriceRangeSlider
        value={{ min: 300000, max: 500000 }}
        onChange={onChange}
        minBound={0}
        maxBound={1000000}
      />
    );
    fireEvent.change(screen.getByTestId('price-max-input'), { target: { value: '100000' } });
    expect(onChange).toHaveBeenCalledWith({ min: 300000, max: 300000 });
  });

  it('clamps min number input to minBound', () => {
    const onChange = vi.fn();
    render(
      <PriceRangeSlider
        value={{ min: 100000, max: 500000 }}
        onChange={onChange}
        minBound={50000}
        maxBound={1000000}
      />
    );
    fireEvent.change(screen.getByTestId('price-min-input'), { target: { value: '10000' } });
    expect(onChange).toHaveBeenCalledWith({ min: 50000, max: 500000 });
  });

  it('clamps max number input to maxBound', () => {
    const onChange = vi.fn();
    render(
      <PriceRangeSlider
        value={{ min: 100000, max: 500000 }}
        onChange={onChange}
        minBound={0}
        maxBound={800000}
      />
    );
    fireEvent.change(screen.getByTestId('price-max-input'), { target: { value: '900000' } });
    expect(onChange).toHaveBeenCalledWith({ min: 100000, max: 800000 });
  });
});

describe('PriceRangeSlider – track fill position', () => {
  it('fill starts at 0% when min is at minBound', () => {
    render(
      <PriceRangeSlider
        value={{ min: 0, max: 500000 }}
        onChange={() => {}}
        minBound={0}
        maxBound={1000000}
      />
    );
    const fill = screen.getByTestId('price-range-fill');
    expect(fill).toHaveStyle({ left: '0%' });
  });

  it('fill ends at 100% when max is at maxBound', () => {
    render(
      <PriceRangeSlider
        value={{ min: 0, max: 1000000 }}
        onChange={() => {}}
        minBound={0}
        maxBound={1000000}
      />
    );
    const fill = screen.getByTestId('price-range-fill');
    expect(fill).toHaveStyle({ width: '100%' });
  });

  it('fill has correct left position for mid-range min', () => {
    render(
      <PriceRangeSlider
        value={{ min: 250000, max: 750000 }}
        onChange={() => {}}
        minBound={0}
        maxBound={1000000}
      />
    );
    const fill = screen.getByTestId('price-range-fill');
    expect(fill).toHaveStyle({ left: '25%' });
  });

  it('fill has correct width for mid-range selection', () => {
    render(
      <PriceRangeSlider
        value={{ min: 250000, max: 750000 }}
        onChange={() => {}}
        minBound={0}
        maxBound={1000000}
      />
    );
    const fill = screen.getByTestId('price-range-fill');
    expect(fill).toHaveStyle({ width: '50%' });
  });
});

describe('PriceRangeSlider – accessibility', () => {
  const defaultValue: PriceRange = { min: 100000, max: 500000 };

  it('min slider has aria-label', () => {
    render(<PriceRangeSlider value={defaultValue} onChange={() => {}} />);
    expect(screen.getByTestId('price-range-min-slider')).toHaveAttribute(
      'aria-label',
      'Minimum price'
    );
  });

  it('max slider has aria-label', () => {
    render(<PriceRangeSlider value={defaultValue} onChange={() => {}} />);
    expect(screen.getByTestId('price-range-max-slider')).toHaveAttribute(
      'aria-label',
      'Maximum price'
    );
  });

  it('min slider has aria-valuenow', () => {
    render(<PriceRangeSlider value={defaultValue} onChange={() => {}} />);
    expect(screen.getByTestId('price-range-min-slider')).toHaveAttribute('aria-valuenow', '100000');
  });

  it('max slider has aria-valuenow', () => {
    render(<PriceRangeSlider value={defaultValue} onChange={() => {}} />);
    expect(screen.getByTestId('price-range-max-slider')).toHaveAttribute('aria-valuenow', '500000');
  });

  it('min number input has aria-label', () => {
    render(<PriceRangeSlider value={defaultValue} onChange={() => {}} />);
    expect(screen.getByTestId('price-min-input')).toHaveAttribute('aria-label', 'Minimum price');
  });

  it('max number input has aria-label', () => {
    render(<PriceRangeSlider value={defaultValue} onChange={() => {}} />);
    expect(screen.getByTestId('price-max-input')).toHaveAttribute('aria-label', 'Maximum price');
  });

  it('min number input is associated with its label', () => {
    render(<PriceRangeSlider value={defaultValue} onChange={() => {}} />);
    const input = screen.getByTestId('price-min-input');
    const label = screen.getByTestId('price-min-label');
    const inputId = input.getAttribute('id');
    expect(label).toHaveAttribute('for', inputId);
  });

  it('max number input is associated with its label', () => {
    render(<PriceRangeSlider value={defaultValue} onChange={() => {}} />);
    const input = screen.getByTestId('price-max-input');
    const label = screen.getByTestId('price-max-label');
    const inputId = input.getAttribute('id');
    expect(label).toHaveAttribute('for', inputId);
  });

  it('price range display has aria-live="polite"', () => {
    render(<PriceRangeSlider value={defaultValue} onChange={() => {}} />);
    expect(screen.getByTestId('price-range-display')).toHaveAttribute('aria-live', 'polite');
  });
});

describe('PriceRangeSlider – controlled state', () => {
  it('reflects external value changes', () => {
    const { rerender } = render(
      <PriceRangeSlider value={{ min: 100000, max: 500000 }} onChange={() => {}} />
    );
    expect(screen.getByTestId('price-range-min-slider')).toHaveValue('100000');

    rerender(<PriceRangeSlider value={{ min: 200000, max: 600000 }} onChange={() => {}} />);
    expect(screen.getByTestId('price-range-min-slider')).toHaveValue('200000');
    expect(screen.getByTestId('price-range-max-slider')).toHaveValue('600000');
  });
});

// ─── Integration: controlled component usage ──────────────────────────────────

describe('PriceRangeSlider – integration (controlled)', () => {
  function ControlledSlider() {
    const [range, setRange] = useState<PriceRange>({ min: 100000, max: 500000 });
    return (
      <div>
        <PriceRangeSlider
          value={range}
          onChange={setRange}
          minBound={0}
          maxBound={1000000}
          step={50000}
        />
        <span data-testid="output-min">{range.min}</span>
        <span data-testid="output-max">{range.max}</span>
      </div>
    );
  }

  it('updates displayed range when min slider changes', () => {
    render(<ControlledSlider />);
    fireEvent.change(screen.getByTestId('price-range-min-slider'), {
      target: { value: '200000' },
    });
    expect(screen.getByTestId('output-min')).toHaveTextContent('200000');
  });

  it('updates displayed range when max slider changes', () => {
    render(<ControlledSlider />);
    fireEvent.change(screen.getByTestId('price-range-max-slider'), {
      target: { value: '800000' },
    });
    expect(screen.getByTestId('output-max')).toHaveTextContent('800000');
  });
});

describe('CheckboxFilterOption – integration (controlled)', () => {
  function ControlledCheckbox() {
    const [checked, setChecked] = useState(false);
    return (
      <div>
        <CheckboxFilterOption label="Busana" checked={checked} onChange={setChecked} count={8} />
        <span data-testid="output">{checked ? 'checked' : 'unchecked'}</span>
      </div>
    );
  }

  it('toggles state on click', async () => {
    render(<ControlledCheckbox />);
    expect(screen.getByTestId('output')).toHaveTextContent('unchecked');
    await userEvent.click(screen.getByTestId('checkbox-filter-input'));
    expect(screen.getByTestId('output')).toHaveTextContent('checked');
    await userEvent.click(screen.getByTestId('checkbox-filter-input'));
    expect(screen.getByTestId('output')).toHaveTextContent('unchecked');
  });
});
