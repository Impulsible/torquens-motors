/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { forwardRef, type ElementType, type ComponentPropsWithRef } from 'react';
import { cn } from '@/utils/cn';

/* -------------------------------------------------------------------------- */
/*                                    TYPES                                   */
/* -------------------------------------------------------------------------- */

export type ContainerSize = 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
export type ContainerGutter = 'none' | 'sm' | 'default' | 'spacious';

export type ContainerProps<T extends ElementType = 'div'> = {
  as?: T;
  size?: ContainerSize;
  gutter?: ContainerGutter;
  centered?: boolean;
  className?: string;
  children?: React.ReactNode;
} & Omit<ComponentPropsWithRef<T>, 'as' | 'size' | 'className' | 'children'>;

/* -------------------------------------------------------------------------- */
/*                              CONTAINER ROOT                                */
/* -------------------------------------------------------------------------- */

export const Container = forwardRef(
  <T extends ElementType = 'div'>(
    {
      as,
      size = 'lg',
      gutter = 'default',
      centered = true,
      className,
      children,
      ...props
    }: ContainerProps<T>,
    ref: React.Ref<any>
  ) => {
    const Component = as || 'div';

    // 📐 Sizing Architecture
    const sizeStyles: Record<ContainerSize, string> = {
      // Focused Reading / Private Client Auth Forms (768px)
      sm: 'max-w-3xl',
      // Editorial Dossiers / Spec Technical Breakdowns (1024px)
      md: 'max-w-5xl',
      // Standard Vehicle Catalog & Grid Systems (1280px - matches container-torquens)
      lg: 'max-w-7xl',
      // High-End Desktop Showroom Showcase (1440px)
      xl: 'max-w-[1440px]',
      // Ultra-Wide Cinematic Hero & Gallery Views (1680px)
      '2xl': 'max-w-[1680px]',
      // Unconstrained Fluid Width
      full: 'max-w-none w-full',
    };

    // 🏎️ Luxury Horizontal Padding / Gutter Rhythm
    const gutterStyles: Record<ContainerGutter, string> = {
      none: 'px-0',
      sm: 'px-3 sm:px-4 lg:px-6',
      default: 'px-4 sm:px-6 lg:px-8',
      // Generous whitespace breathing room for premium editorial layouts
      spacious: 'px-6 sm:px-10 lg:px-12 xl:px-16',
    };

    return (
      <Component
        ref={ref}
        className={cn(
          'w-full',
          centered && 'mx-auto',
          sizeStyles[size],
          gutterStyles[gutter],
          className
        )}
        {...props}
      >
        {children}
      </Component>
    );
  }
);

Container.displayName = 'Container';