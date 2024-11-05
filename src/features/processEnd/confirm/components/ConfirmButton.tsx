import React from 'react';

import { Button } from 'src/app-components/button/Button';
import { useLaxProcessData } from 'src/features/instance/ProcessContext';
import { useProcessNavigation } from 'src/features/instance/ProcessNavigationContext';
import { Lang } from 'src/features/language/Lang';
import type { ButtonProps } from 'src/app-components/button/Button';

type IConfirmButtonProps = Omit<ButtonProps, 'onClick' | 'id'> & { nodeId: string };

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
      <Button
        id={nodeId}
        {...props}
        isLoading={!!processNextBusyId}
        onClick={handleConfirmClick}
        disabled={disabled}
        color='success'
        variant='primary'
      >
        <Lang id={'confirm.button_text'} />
      </Button>
    </div>
  );
};
