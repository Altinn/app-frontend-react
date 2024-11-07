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
} & Pick<
  ButtonHTMLAttributes<HTMLButtonElement>,
  | 'aria-label'
  | 'onClick'
  | 'style'
  | 'tabIndex'
  | 'onMouseDown'
  | 'aria-controls'
  | 'aria-haspopup'
  | 'aria-expanded'
  | 'aria-labelledby'
  | 'aria-describedby'
>;

export type ButtonVariant = Parameters<typeof DesignSystemButton>[0]['variant'];
export type ButtonColor = Parameters<typeof DesignSystemButton>[0]['color'];

export const Button = ({
  id,
  title,
  disabled,
  variant = 'primary',
  color, // TODO: set default to 'accent' when design system is updated
  size = 'sm',
  className,
  icon,
  isLoading = false,
  'aria-label': ariaLabel,
  'aria-controls': ariaControls,
  'aria-haspopup': ariaHasPopup,
  'aria-expanded': ariaExpanded,
  'aria-labelledby': ariaLabelledBy,
  'aria-describedby': ariaDescribedBy,
  style,
  tabIndex,
  onClick,
  onMouseDown,
  children,
}: PropsWithChildren<ButtonProps>) => (
  <DesignSystemButton
    id={id}
    title={title}
    disabled={disabled || isLoading}
    variant={variant}
    color={color}
    size={size}
    icon={icon}
    className={className}
    aria-label={ariaLabel}
    style={style}
    tabIndex={tabIndex}
    onClick={onClick}
    onMouseDown={onMouseDown}
    aria-busy={isLoading}
    aria-controls={ariaControls}
    aria-haspopup={ariaHasPopup}
    aria-expanded={ariaExpanded}
    aria-labelledby={ariaLabelledBy}
    aria-describedby={ariaDescribedBy}
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
