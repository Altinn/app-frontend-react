import React, { useState } from 'react';

import { useLaxProcessData } from 'src/features/instance/useProcess';
import { useProcessNext } from 'src/features/instance/useProcessNext';
import { ValidationActions } from 'src/features/validation/validationSlice';
import { useAppDispatch } from 'src/hooks/useAppDispatch';
import { useLanguage } from 'src/hooks/useLanguage';
import { SubmitButton } from 'src/layout/Button/SubmitButton';
import { useExprContext } from 'src/utils/layout/ExprContext';
import { httpGet } from 'src/utils/network/networking';
import { getValidationUrl } from 'src/utils/urls/appUrlHelper';
import { mapValidationIssues } from 'src/utils/validation/backendValidation';
import { createValidationResult } from 'src/utils/validation/validationHelpers';
import type { BaseButtonProps } from 'src/layout/Button/WrappedButton';

type IConfirmButtonProps = Omit<BaseButtonProps, 'onClick'>;

export const ConfirmButton = (props: IConfirmButtonProps) => {
  const [validating, setValidating] = useState<boolean>(false);
  const { actions } = useLaxProcessData()?.currentTask || {};
  const { nodeId } = props;
  const disabled = !actions?.confirm;
  const resolvedNodes = useExprContext();
  const { mutate: processNext, busyWithId: processNextBusyId } = useProcessNext(nodeId);

  const dispatch = useAppDispatch();
  const langTools = useLanguage();
  const { lang } = langTools;
  const { instanceId } = window;

  const handleConfirmClick = () => {
    if (!disabled && instanceId && resolvedNodes) {
      setValidating(true);

      // TODO: Do not handle validating here, do it generically in the useProcessNext hook instead
      httpGet(getValidationUrl(instanceId))
        .then((serverValidations: any) => {
          const validationObjects = mapValidationIssues(serverValidations, resolvedNodes, langTools);
          const validationResult = createValidationResult(validationObjects);
          dispatch(
            ValidationActions.updateValidations({
              validationResult,
              merge: false,
            }),
          );
          if (serverValidations.length === 0) {
            processNext({ action: 'confirm' });
          }
        })
        .catch((error) => {
          window.logError('Validating on confirm failed:\n', error);
        })
        .finally(() => {
          setValidating(false);
        });
    }
  };

  const busyWithId = processNextBusyId || (validating ? nodeId : null) || null;

  return (
    <div style={{ marginTop: 'var(--button-margin-top)' }}>
      <SubmitButton
        {...props}
        busyWithId={busyWithId}
        onClick={handleConfirmClick}
        disabled={disabled}
      >
        {lang('confirm.button_text')}
      </SubmitButton>
    </div>
  );
};
