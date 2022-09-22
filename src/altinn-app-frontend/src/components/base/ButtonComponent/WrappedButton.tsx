import React from 'react';

import { Button, ButtonVariant } from '@altinn/altinn-design-system';
import classNames from 'classnames';

import { ButtonLoader } from 'src/components/base/ButtonComponent/ButtonLoader';
import css from 'src/components/base/ButtonComponent/WrappedButton.module.css';
import type { buttonLoaderProps } from 'src/components/base/ButtonComponent/ButtonLoader';

export interface BaseButtonProps {
  onClick: (...args) => void;
  busyWithId?: string;
  setBusyWithId?: (string) => void;
  disabled?: boolean;
}

export interface ButtonProps extends buttonLoaderProps, BaseButtonProps {
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
    if (!thisIsLoading) {
      if (setBusyWithId) {
        setBusyWithId(id);
      }
      await onClick(args);
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
