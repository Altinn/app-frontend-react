import React from 'react';

import { useProcessNextTasks } from 'src/hooks/queries/useProcessNextTasks';
import { useAppDispatch } from 'src/hooks/useAppDispatch';
import { useCanSubmitForm } from 'src/hooks/useCanSubmitForm';
import { WrappedButton } from 'src/layout/Button/WrappedButton';
import type { IButtonProvidedProps } from 'src/layout/Button/ButtonComponent';

export const GoToTaskButton = ({ children, ...props }: React.PropsWithChildren<IButtonProvidedProps>) => {
  const dispatch = useAppDispatch();
  const { canSubmit, busyWithId, message } = useCanSubmitForm();
  const taskId = props.node.isType('Button') ? props.node.item.taskId : undefined;
  const availableProcessTasks = useProcessNextTasks();
  const canGoToTask = canSubmit && availableProcessTasks.includes(taskId || '');
  const navigateToTask = () => {
    if (canGoToTask) {
      dispatch(
        ProcessActions.complete({
          taskId,
        }),
      );
    }
  };

  return (
    <WrappedButton
      disabled={!canGoToTask}
      busyWithId={busyWithId}
      message={message}
      onClick={navigateToTask}
      {...props}
      variant={'outline'}
    >
      {children}
    </WrappedButton>
  );
};
