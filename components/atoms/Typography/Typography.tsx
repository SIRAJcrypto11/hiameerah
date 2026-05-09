import React from 'react';
import { cn } from '@/lib/utils';

// ─── Heading ──────────────────────────────────────────────────────────────────

export type HeadingLevel = 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
export type HeadingSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl';

export interface HeadingProps extends React.HTMLAttributes<HTMLHeadingElement> {
  /** HTML heading level */
  as?: HeadingLevel;
  /** Visual size (defaults to the semantic level's natural size) */
  size?: HeadingSize;
  /** Use display (serif) font instead of sans */
  display?: boolean;
  /** Additional class names */
  className?: string;
  children: React.ReactNode;
}

const headingSizeClasses: Record<HeadingSize, string> = {
  xs: 'text-sm font-semibold',
  sm: 'text-base font-semibold',
  md: 'text-lg font-semibold',
  lg: 'text-xl font-bold',
  xl: 'text-2xl font-bold',
  '2xl': 'text-3xl font-bold',
  '3xl': 'text-4xl font-bold',
  '4xl': 'text-5xl font-bold',
};

/** Default size for each heading level */
const defaultHeadingSize: Record<HeadingLevel, HeadingSize> = {
  h1: '3xl',
  h2: '2xl',
  h3: 'xl',
  h4: 'lg',
  h5: 'md',
  h6: 'sm',
};

/**
 * Heading component.
 *
 * Renders h1–h6 with responsive, brand-consistent typography.
 * Supports both sans-serif (default) and display/serif fonts.
 *
 * Satisfies Requirements 15.4 (responsive typography) and 28.3 (elegant typography).
 */
export const Heading = React.forwardRef<HTMLHeadingElement, HeadingProps>(
  ({ as: Tag = 'h2', size, display = false, className, children, ...rest }, ref) => {
    const resolvedSize = size ?? defaultHeadingSize[Tag];

    return (
      <Tag
        ref={ref}
        className={cn(
          headingSizeClasses[resolvedSize],
          'leading-tight tracking-tight text-secondary-900',
          display ? 'font-display' : 'font-sans',
          className
        )}
        {...rest}
      >
        {children}
      </Tag>
    );
  }
);

Heading.displayName = 'Heading';

// ─── Text ─────────────────────────────────────────────────────────────────────

export type TextSize = 'xs' | 'sm' | 'base' | 'lg' | 'xl';
export type TextWeight = 'normal' | 'medium' | 'semibold' | 'bold';
export type TextColor = 'default' | 'muted' | 'subtle' | 'primary' | 'error' | 'success';

export interface TextProps extends React.HTMLAttributes<HTMLElement> {
  /** HTML element to render */
  as?: 'p' | 'span' | 'div' | 'label' | 'small' | 'strong' | 'em';
  /** Font size */
  size?: TextSize;
  /** Font weight */
  weight?: TextWeight;
  /** Semantic colour */
  color?: TextColor;
  /** Truncate text with ellipsis */
  truncate?: boolean;
  /** Additional class names */
  className?: string;
  children: React.ReactNode;
}

const textSizeClasses: Record<TextSize, string> = {
  xs: 'text-xs',
  sm: 'text-sm',
  base: 'text-base',
  lg: 'text-lg',
  xl: 'text-xl',
};

const textWeightClasses: Record<TextWeight, string> = {
  normal: 'font-normal',
  medium: 'font-medium',
  semibold: 'font-semibold',
  bold: 'font-bold',
};

const textColorClasses: Record<TextColor, string> = {
  default: 'text-secondary-900',
  muted: 'text-secondary-600',
  subtle: 'text-secondary-400',
  primary: 'text-primary-500',
  error: 'text-red-500',
  success: 'text-accent-mint-600',
};

/**
 * Text component.
 *
 * Renders body text with configurable size, weight, and colour.
 * Supports polymorphic rendering via the `as` prop.
 *
 * Satisfies Requirements 15.4 (responsive typography) and 28.3 (elegant typography).
 */
export const Text = React.forwardRef<HTMLElement, TextProps>(
  (
    {
      as: Tag = 'p',
      size = 'base',
      weight = 'normal',
      color = 'default',
      truncate = false,
      className,
      children,
      ...rest
    },
    ref
  ) => {
    return (
      // @ts-expect-error – polymorphic ref typing
      <Tag
        ref={ref}
        className={cn(
          'font-sans leading-relaxed',
          textSizeClasses[size],
          textWeightClasses[weight],
          textColorClasses[color],
          truncate && 'truncate',
          className
        )}
        {...rest}
      >
        {children}
      </Tag>
    );
  }
);

Text.displayName = 'Text';
