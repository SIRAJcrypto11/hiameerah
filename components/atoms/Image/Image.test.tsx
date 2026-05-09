import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import Image from './Image';

// ─── Mock next/image ──────────────────────────────────────────────────────────
// Render as a plain <img> so tests run without Next.js internals.
vi.mock('next/image', () => ({
  default: ({
    src,
    alt,
    fill: _fill,
    placeholder: _placeholder,
    blurDataURL: _blurDataURL,
    onLoad,
    onError,
    className,
    sizes: _sizes,
    priority: _priority,
    quality: _quality,
    width,
    height,
    ...rest
  }: {
    src: string;
    alt: string;
    fill?: boolean;
    placeholder?: string;
    blurDataURL?: string;
    onLoad?: () => void;
    onError?: () => void;
    className?: string;
    sizes?: string;
    priority?: boolean;
    quality?: number;
    width?: number;
    height?: number;
    [key: string]: unknown;
  }) => (
    <img
      src={src}
      alt={alt}
      onLoad={onLoad}
      onError={onError}
      className={className}
      width={width}
      height={height}
      data-testid="next-image"
      {...rest}
    />
  ),
}));

// ─── Rendering ────────────────────────────────────────────────────────────────

describe('Image – rendering', () => {
  it('renders an img element with the correct src and alt', () => {
    render(<Image src="/product.jpg" alt="Product photo" width={300} height={400} />);
    const img = screen.getByTestId('next-image');
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute('src', '/product.jpg');
    expect(img).toHaveAttribute('alt', 'Product photo');
  });

  it('renders a wrapper div around the image', () => {
    const { container } = render(
      <Image src="/product.jpg" alt="Product" width={300} height={400} />
    );
    expect(container.firstChild).toBeInstanceOf(HTMLDivElement);
  });

  it('applies wrapperClassName to the outer div', () => {
    const { container } = render(
      <Image
        src="/product.jpg"
        alt="Product"
        width={300}
        height={400}
        wrapperClassName="custom-wrapper"
      />
    );
    expect(container.firstChild).toHaveClass('custom-wrapper');
  });

  it('applies className to the img element', () => {
    render(
      <Image src="/product.jpg" alt="Product" width={300} height={400} className="custom-img" />
    );
    expect(screen.getByTestId('next-image')).toHaveClass('custom-img');
  });

  it('forwards ref to the wrapper div', () => {
    const ref = React.createRef<HTMLDivElement>();
    render(<Image ref={ref} src="/product.jpg" alt="Product" width={300} height={400} />);
    expect(ref.current).toBeInstanceOf(HTMLDivElement);
  });
});

// ─── Aspect ratio (Req 30.3) ──────────────────────────────────────────────────

describe('Image – aspect ratio', () => {
  it('applies 3:4 aspect ratio class for product preset', () => {
    const { container } = render(
      <Image src="/product.jpg" alt="Product" aspectRatio="product" width={300} height={400} />
    );
    expect(container.firstChild).toHaveClass('aspect-[3/4]');
  });

  it('applies 16:9 aspect ratio class for banner preset', () => {
    const { container } = render(
      <Image src="/banner.jpg" alt="Banner" aspectRatio="banner" width={1600} height={900} />
    );
    expect(container.firstChild).toHaveClass('aspect-video');
  });

  it('applies square aspect ratio class for square preset', () => {
    const { container } = render(
      <Image src="/avatar.jpg" alt="Avatar" aspectRatio="square" width={200} height={200} />
    );
    expect(container.firstChild).toHaveClass('aspect-square');
  });

  it('does not apply an aspect ratio class for auto preset', () => {
    const { container } = render(
      <Image src="/image.jpg" alt="Image" aspectRatio="auto" width={300} height={200} />
    );
    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper.className).not.toMatch(/aspect-/);
  });

  it('defaults to auto aspect ratio when no aspectRatio prop is given', () => {
    const { container } = render(<Image src="/image.jpg" alt="Image" width={300} height={200} />);
    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper.className).not.toMatch(/aspect-/);
  });
});

// ─── Progressive loading / blur placeholder (Req 30.7, 16.3) ─────────────────

describe('Image – progressive loading', () => {
  it('starts with opacity-0 on the img before load', () => {
    render(<Image src="/product.jpg" alt="Product" width={300} height={400} />);
    expect(screen.getByTestId('next-image')).toHaveClass('opacity-0');
  });

  it('transitions to opacity-100 after the image loads', () => {
    render(<Image src="/product.jpg" alt="Product" width={300} height={400} />);
    const img = screen.getByTestId('next-image');
    fireEvent.load(img);
    expect(img).toHaveClass('opacity-100');
    expect(img).not.toHaveClass('opacity-0');
  });

  it('applies transition-opacity class for smooth fade-in', () => {
    render(<Image src="/product.jpg" alt="Product" width={300} height={400} />);
    expect(screen.getByTestId('next-image')).toHaveClass('transition-opacity');
  });
});

// ─── Error fallback (Req 30.7) ────────────────────────────────────────────────

describe('Image – error fallback', () => {
  it('shows the default fallback when the image fails to load', () => {
    render(<Image src="/broken.jpg" alt="Broken" width={300} height={400} />);
    const img = screen.getByTestId('next-image');
    fireEvent.error(img);
    expect(screen.getByTestId('image-fallback')).toBeInTheDocument();
  });

  it('hides the img element after an error', () => {
    render(<Image src="/broken.jpg" alt="Broken" width={300} height={400} />);
    const img = screen.getByTestId('next-image');
    fireEvent.error(img);
    expect(screen.queryByTestId('next-image')).not.toBeInTheDocument();
  });

  it('renders a custom fallback node when provided', () => {
    render(
      <Image
        src="/broken.jpg"
        alt="Broken"
        width={300}
        height={400}
        fallback={<div data-testid="custom-fallback">Image unavailable</div>}
      />
    );
    const img = screen.getByTestId('next-image');
    fireEvent.error(img);
    expect(screen.getByTestId('custom-fallback')).toBeInTheDocument();
    expect(screen.getByText('Image unavailable')).toBeInTheDocument();
  });

  it('does not show fallback when image loads successfully', () => {
    render(<Image src="/product.jpg" alt="Product" width={300} height={400} />);
    const img = screen.getByTestId('next-image');
    fireEvent.load(img);
    expect(screen.queryByTestId('image-fallback')).not.toBeInTheDocument();
  });
});

// ─── Fill mode ────────────────────────────────────────────────────────────────

describe('Image – fill mode', () => {
  it('does not apply aspect ratio class when fill=true', () => {
    const { container } = render(
      <Image src="/product.jpg" alt="Product" fill aspectRatio="product" />
    );
    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper.className).not.toMatch(/aspect-/);
  });

  it('still renders the img when fill=true', () => {
    render(<Image src="/product.jpg" alt="Product" fill />);
    expect(screen.getByTestId('next-image')).toBeInTheDocument();
  });
});

// ─── Accessibility ────────────────────────────────────────────────────────────

describe('Image – accessibility (Req 17.7, 18.7)', () => {
  it('passes alt text to the underlying img', () => {
    render(
      <Image src="/product.jpg" alt="A beautiful hijab in soft pink" width={300} height={400} />
    );
    expect(screen.getByAltText('A beautiful hijab in soft pink')).toBeInTheDocument();
  });

  it('default fallback is aria-hidden (decorative placeholder)', () => {
    render(<Image src="/broken.jpg" alt="Broken" width={300} height={400} />);
    fireEvent.error(screen.getByTestId('next-image'));
    const fallback = screen.getByTestId('image-fallback');
    expect(fallback).toHaveAttribute('aria-hidden', 'true');
  });
});

// ─── Wrapper structure ────────────────────────────────────────────────────────

describe('Image – wrapper structure', () => {
  it('wrapper always has relative and overflow-hidden classes', () => {
    const { container } = render(
      <Image src="/product.jpg" alt="Product" width={300} height={400} />
    );
    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper).toHaveClass('relative');
    expect(wrapper).toHaveClass('overflow-hidden');
  });
});
