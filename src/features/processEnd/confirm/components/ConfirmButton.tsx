import React from 'react';

import { useLaxProcessData } from 'src/features/instance/ProcessContext';
import { useProcessNavigation } from 'src/features/instance/ProcessNavigationContext';
import { Lang } from 'src/features/language/Lang';
import { type BaseButtonProps, WrappedButton } from 'src/layout/Button/WrappedButton';

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
      <WrappedButton
        {...props}
        busyWithId={processNextBusyId}
        onClick={handleConfirmClick}
        disabled={disabled}
        color='success'
        variant='primary'
      >
        <Lang id={'confirm.button_text'} />
      </WrappedButton>
    </div>
  );
};
