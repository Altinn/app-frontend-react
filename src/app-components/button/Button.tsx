import React from 'react';
import type { ButtonHTMLAttributes, PropsWithChildren } from 'react';

import { Button as DesignSystemButton, Spinner } from '@digdir/designsystemet-react';

export type ButtonProps = {
  id?: string;
  title?: string;
  disabled?: boolean;
  variant?: ButtonVariant;
  color?: ButtonColor;
  isLoading?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  icon?: boolean;
} & Pick<ButtonHTMLAttributes<HTMLButtonElement>, 'aria-label' | 'onClick' | 'style' | 'tabIndex'>;

export type ButtonVariant = Parameters<typeof DesignSystemButton>[0]['variant'];
export type ButtonColor = Parameters<typeof DesignSystemButton>[0]['color'];

export const Button = ({
  id,
  title,
  disabled,
  variant = 'primary',
  color, // TODO: set default to 'accent' when design system is updated
  size = 'sm',
  onClick,
  className,
  icon,
  isLoading = false,
  'aria-label': ariaLabel,
  style,
  tabIndex,
  children,
}: PropsWithChildren<ButtonProps>) => (
  <DesignSystemButton
    id={id}
    title={title}
    disabled={disabled || isLoading}
    variant={variant}
    color={color}
    size={size}
    onClick={onClick}
    icon={icon}
    className={className}
    aria-label={ariaLabel}
    style={style}
    tabIndex={tabIndex}
  >
    {isLoading && (
      <Spinner
        aria-hidden='true'
        color={color}
        size={size === 'lg' ? 'sm' : 'xs'}
        title='Laster innhold'
      />
    )}
    {children}
  </DesignSystemButton>
);
