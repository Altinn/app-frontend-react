import React from 'react';

import { useLaxProcessData } from 'src/features/instance/ProcessContext';
import { useProcessNavigation } from 'src/features/instance/ProcessNavigationContext';
import { Lang } from 'src/features/language/Lang';
import { SubmitButton } from 'src/layout/Button/SubmitButton';
import type { BaseButtonProps } from 'src/layout/Button/WrappedButton';

type IConfirmButtonProps = Omit<BaseButtonProps, 'onClick'>;

export const ConfirmButton = (props: IConfirmButtonProps) => {
  const { actions } = useLaxProcessData()?.currentTask || {};
  const { nodeId } = props;
  const disabled = !actions?.confirm;
  const { next, busyWithId: processNextBusyId } = useProcessNavigation() || {};

  const handleConfirmClick = () => {
    if (!disabled && nodeId) {
      next?.({ action: 'confirm', nodeId });
    }
  };

  return (
    <div style={{ marginTop: 'var(--button-margin-top)' }}>
      <SubmitButton
        {...props}
        busyWithId={processNextBusyId}
        onClick={handleConfirmClick}
        disabled={disabled}
      >
        <Lang id={'confirm.button_text'} />
      </SubmitButton>
    </div>
  );
};
