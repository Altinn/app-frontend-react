import React, { forwardRef } from 'react';
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
  ref?: React.RefObject<HTMLButtonElement>;
  fullWidth?: boolean;
} & Pick<
  ButtonHTMLAttributes<HTMLButtonElement>,
  | 'onClick'
  | 'style'
  | 'tabIndex'
  | 'onMouseDown'
  | 'aria-label'
  | 'aria-busy'
  | 'aria-controls'
  | 'aria-haspopup'
  | 'aria-expanded'
  | 'aria-labelledby'
  | 'aria-describedby'
  | 'onKeyUp'
>;

export type ButtonVariant = Parameters<typeof DesignSystemButton>[0]['variant'];
export type ButtonColor = Parameters<typeof DesignSystemButton>[0]['color'];

export const Button = forwardRef<HTMLButtonElement, PropsWithChildren<ButtonProps>>(function Button(
  {
    id,
    title,
    disabled,
    variant = 'primary',
    color = 'first',
    size = 'sm',
    className,
    icon,
    isLoading = false,
    'aria-label': ariaLabel,
    'aria-busy': ariaBusy,
    'aria-controls': ariaControls,
    'aria-haspopup': ariaHasPopup,
    'aria-expanded': ariaExpanded,
    'aria-labelledby': ariaLabelledBy,
    'aria-describedby': ariaDescribedBy,
    style,
    tabIndex,
    fullWidth,
    onClick,
    onMouseDown,
    children,
  },
  ref,
) {
  return (
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
      aria-busy={ariaBusy}
      aria-controls={ariaControls}
      aria-haspopup={ariaHasPopup}
      aria-expanded={ariaExpanded}
      aria-labelledby={ariaLabelledBy}
      aria-describedby={ariaDescribedBy}
      ref={ref}
      fullWidth={fullWidth}
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
});
