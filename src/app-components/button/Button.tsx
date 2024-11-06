import React from 'react';
import type { PropsWithChildren } from 'react';

import { Button as DesignSystemButton, Spinner } from '@digdir/designsystemet-react';

export interface ButtonProps {
  id?: string;
  disabled?: boolean;
  variant?: ButtonVariant;
  color?: ButtonColor;
  isLoading?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  onClick: () => void;
}

export type ButtonVariant = Parameters<typeof DesignSystemButton>[0]['variant'];
export type ButtonColor = Parameters<typeof DesignSystemButton>[0]['color'];

export const Button = ({
  id,
  disabled,
  variant,
  color,
  size = 'sm',
  onClick,
  className,
  isLoading = false,
  children,
}: PropsWithChildren<ButtonProps>) => (
  <DesignSystemButton
    id={id}
    disabled={disabled || isLoading}
    variant={variant}
    color={color}
    size={size}
    onClick={onClick}
    className={className}
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
