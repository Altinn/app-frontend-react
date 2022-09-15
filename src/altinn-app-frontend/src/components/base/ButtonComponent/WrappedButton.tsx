import React from 'react';

import { Button, ButtonVariant } from '@altinn/altinn-design-system';
import classNames from 'classnames';

import { ButtonLoader } from 'src/components/base/ButtonComponent/ButtonLoader';
import css from 'src/components/base/ButtonComponent/WrappedButton.module.css';
import type { buttonLoaderProps } from 'src/components/base/ButtonComponent/ButtonLoader';

export interface baseButtonProps {
  onClick: (...args) => void;
  busyWithId?: string;
}

export interface buttonProps extends buttonLoaderProps, baseButtonProps {
  id: string;
  children: React.ReactNode;
}

interface props extends buttonProps {
  variant?: ButtonVariant;
}

export const WrappedButton = ({
  variant = ButtonVariant.Secondary,
  onClick,
  id,
  children,
  busyWithId,
  language,
}: props) => {
  const somethingIsLoading = !!busyWithId;
  const thisIsLoading = busyWithId === id;
  const handleClick = (...args) => {
    if (!thisIsLoading) {
      onClick(args);
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
      >
        { children }
        { thisIsLoading && <ButtonLoader language={language} />}
      </Button>
    </span>
  );
};
