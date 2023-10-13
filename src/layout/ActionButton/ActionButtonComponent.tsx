import React from 'react';

import { Button } from '@digdir/design-system-react';

import type { PropsFromGenericComponent } from '..';

import { useLaxProcessData } from 'src/features/instance/ProcessContext';
import { useProcessNext } from 'src/features/instance/useProcessNext';
import { useLanguage } from 'src/hooks/useLanguage';
import { ButtonLoader } from 'src/layout/Button/ButtonLoader';
import { LayoutPage } from 'src/utils/layout/LayoutPage';
import type { ActionButtonStyle } from 'src/layout/ActionButton/config.generated';
import type { ButtonColor, ButtonVariant } from 'src/layout/Button/WrappedButton';

export const buttonStyles: { [style in ActionButtonStyle]: { color: ButtonColor; variant: ButtonVariant } } = {
  primary: { variant: 'filled', color: 'success' },
  secondary: { variant: 'outline', color: 'primary' },
};

export type IActionButton = PropsFromGenericComponent<'ActionButton'>;

export function ActionButtonComponent({ node }: IActionButton) {
  const { busyWithId, isLoading, mutate } = useProcessNext(node.item.id);
  const actionPermissions = useLaxProcessData()?.currentTask?.actions;
  const { lang } = useLanguage();

  const { action, buttonStyle, id, textResourceBindings } = node.item;
  const disabled = !actionPermissions?.[action];
  const isLoadingHere = busyWithId === id;

  function handleClick() {
    if (!disabled && !isLoading) {
      mutate({ action });
    }
  }

  const parentIsPage = node.parent instanceof LayoutPage;
  const buttonText = lang(textResourceBindings?.title ?? `actions.${action}`);
  const { color, variant } = buttonStyles[buttonStyle];

  return (
    <ButtonLoader
      isLoading={isLoadingHere}
      style={{
        marginTop: parentIsPage ? 'var(--button-margin-top)' : undefined,
      }}
    >
      <Button
        size='small'
        id={`action-button-${id}`}
        variant={variant}
        color={color}
        disabled={disabled || isLoadingHere || isLoading}
        onClick={handleClick}
      >
        {buttonText}
      </Button>
    </ButtonLoader>
  );
}
