import React from 'react';
import type { PropsWithChildren } from 'react';

import { Button as DesignSystemButton, Spinner } from '@digdir/designsystemet-react';

export interface ButtonProps {
  id: string;
  disabled?: boolean;
  variant?: ButtonVariant;
  color?: ButtonColor;
  isLoading?: boolean;
  size?: 'sm' | 'md' | 'lg';
  onClick: () => void;
}

export type ButtonVariant = Parameters<typeof DesignSystemButton>[0]['variant'];
export type ButtonColor = Parameters<typeof DesignSystemButton>[0]['color'];

export const Button = ({ children, isLoading = false, ...props }: PropsWithChildren<ButtonProps>) => (
  <DesignSystemButton
    id={props.id}
    disabled={props.disabled || isLoading}
    variant={props.variant}
    color={props.color}
    size={props.size}
    onClick={props.onClick}
  >
    {isLoading && (
      <Spinner
        aria-hidden='true'
        color={props.color}
        data-size={props.size}
        title='button-spinner-loading'
      />
    )}
    {children}
  </DesignSystemButton>
);
