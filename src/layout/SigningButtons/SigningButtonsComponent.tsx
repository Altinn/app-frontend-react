import React from 'react';
import { useDispatch } from 'react-redux';

import { Button, ButtonColor, ButtonVariant, ErrorMessage } from '@digdir/design-system-react';

import type { PropsFromGenericComponent } from '..';

import { useAppSelector } from 'src/common/hooks/useAppSelector';
import { getLanguageFromKey } from 'src/language/sharedLanguage';
import classes from 'src/layout/SigningButtons/SigningButtonsComponent.module.css';
import { ProcessActions } from 'src/shared/resources/process/processSlice';
import { getTextResource } from 'src/utils/formComponentUtils';

export type ISigningButtons = PropsFromGenericComponent<'SigningButtons'>;

export function SigningButtonsComponent({ node }: ISigningButtons) {
  const dispatch = useDispatch();
  const { sign, reject } = useAppSelector((state) => state.process.actions ?? {});
  const textResources = useAppSelector((state) => state.textResources.resources);
  const language = useAppSelector((state) => state.language.language);
  const props = node.item;

  const signDisabled = !sign;
  const rejectDisabled = props.showRejectButton && !reject;

  function handleSign() {
    if (!signDisabled) {
      dispatch(
        ProcessActions.complete({
          action: 'sign',
        }),
      );
    }
  }

  function handleReject() {
    if (!rejectDisabled) {
      dispatch(
        ProcessActions.complete({
          action: 'reject',
        }),
      );
    }
  }

  const signText = props.textResourceBindings?.sign
    ? getTextResource(props.textResourceBindings.sign, textResources)
    : getLanguageFromKey('Sign', language ?? {});

  const rejectText = props.textResourceBindings?.reject
    ? getTextResource(props.textResourceBindings.reject, textResources)
    : getLanguageFromKey('Reject', language ?? {});

  return (
    <div className={classes.container}>
      <div className={classes.buttonWrapper}>
        {props.showRejectButton && (
          <Button
            variant={ButtonVariant.Outline}
            disabled={rejectDisabled}
            onClick={handleReject}
          >
            {rejectText}
          </Button>
        )}
        <Button
          color={ButtonColor.Success}
          disabled={signDisabled}
          onClick={handleSign}
        >
          {signText}
        </Button>
      </div>
      {signDisabled && !rejectDisabled && <ErrorMessage>Du mangler rettigheter til å signere.</ErrorMessage>}
      {!signDisabled && rejectDisabled && <ErrorMessage>Du mangler rettigheter til å avslå.</ErrorMessage>}
      {signDisabled && rejectDisabled && <ErrorMessage>Du mangler rettigheter til å signere eller avslå.</ErrorMessage>}
    </div>
  );
}
