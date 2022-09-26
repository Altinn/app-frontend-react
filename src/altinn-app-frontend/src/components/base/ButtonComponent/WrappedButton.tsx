import React from 'react';

import { Button, ButtonVariant } from '@altinn/altinn-design-system';
import classNames from 'classnames';

import { ButtonLoader } from 'src/components/base/ButtonComponent/ButtonLoader';
import css from 'src/components/base/ButtonComponent/WrappedButton.module.css';
import type { ButtonLoaderProps } from 'src/components/base/ButtonComponent/ButtonLoader';

export interface BaseButtonProps {
  onClick: (...args) => void;
  busyWithId?: string;
  setBusyWithId?: (id: string) => void;
  disabled?: boolean;
}

export interface ButtonProps extends ButtonLoaderProps, BaseButtonProps {
  id: string;
  children: React.ReactNode;
}

interface Props extends ButtonProps {
  variant?: ButtonVariant;
}

export const WrappedButton = ({
  variant = ButtonVariant.Secondary,
  onClick,
  id,
  children,
  busyWithId,
  setBusyWithId,
  language,
  disabled,
}: Props) => {
  const somethingIsLoading = !!busyWithId;
  const thisIsLoading = busyWithId === id;
  const handleClick = async (...args) => {
    if (!somethingIsLoading) {
      if (setBusyWithId) {
        setBusyWithId(id);
      }
      onClick(args);
      if (setBusyWithId) {
        setBusyWithId('');
      }
    }
  };
  return (
    <span
      className={classNames(
        css['wrapped-button'],
        somethingIsLoading && css['wrapped-button--loading'],
        thisIsLoading && css['wrapped-button--busy'],
      )}
    >
      <Button
        variant={variant}
        onClick={handleClick}
        id={id}
        disabled={disabled}
      >
        {children}
        {thisIsLoading && <ButtonLoader language={language} />}
      </Button>
    </span>
  );
};
