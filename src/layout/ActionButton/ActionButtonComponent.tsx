import React from 'react';

import { useIsMutating } from '@tanstack/react-query';

import type { PropsFromGenericComponent } from '..';

import { Button, type ButtonColor, type ButtonVariant } from 'src/app-components/Button/Button';
import { useProcessNext } from 'src/features/instance/useProcessNext';
import { Lang } from 'src/features/language/Lang';
import { useIsSubformPage } from 'src/features/routing/AppRoutingContext';
import { ComponentStructureWrapper } from 'src/layout/ComponentStructureWrapper';
import { useActionAuthorization } from 'src/layout/CustomButton/CustomButtonComponent';
import { useNodeItem } from 'src/utils/layout/useNodeItem';
import type { ActionButtonStyle } from 'src/layout/ActionButton/config.generated';

export const buttonStyles: { [style in ActionButtonStyle]: { color: ButtonColor; variant: ButtonVariant } } = {
  primary: { variant: 'primary', color: 'success' },
  secondary: { variant: 'secondary', color: 'first' },
};

export type IActionButton = PropsFromGenericComponent<'ActionButton'>;

export function ActionButtonComponent({ node }: IActionButton) {
  const { processNext, isPending: isThisProcessing } = useProcessNext();
  const isAnyProcessing = useIsMutating() > 0;

  const { isAuthorized } = useActionAuthorization();

  const { action, buttonStyle, id, textResourceBindings } = useNodeItem(node);
  const disabled = !isAuthorized(action) || isAnyProcessing;

  if (useIsSubformPage()) {
    throw new Error('Cannot use process navigation in a subform');
  }

  // FIXME: app crashes hard if buttonStyle is configured incorrectly
  const { color, variant } = buttonStyles[buttonStyle];

  return (
    <ComponentStructureWrapper node={node}>
      <Button
        id={`action-button-${id}`}
        variant={variant}
        color={color}
        disabled={disabled}
        isLoading={isThisProcessing}
        onClick={() => processNext({ action })}
      >
        <Lang id={textResourceBindings?.title ?? `actions.${action}`} />
      </Button>
    </ComponentStructureWrapper>
  );
}
