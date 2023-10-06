import React from 'react';

import { useProcessNext } from 'src/features/instance/useProcessNext';
import { useProcessNextTasks } from 'src/features/instance/useProcessNextTasks';
import { useCanSubmitForm } from 'src/hooks/useCanSubmitForm';
import { WrappedButton } from 'src/layout/Button/WrappedButton';
import type { IButtonProvidedProps } from 'src/layout/Button/ButtonComponent';

export const GoToTaskButton = ({ children, ...props }: React.PropsWithChildren<IButtonProvidedProps>) => {
  const { canSubmit, busyWithId, message } = useCanSubmitForm();
  const taskId = props.node.isType('Button') ? props.node.item.taskId : undefined;
  const availableProcessTasks = useProcessNextTasks();
  const { mutate: processNext } = useProcessNext(props.node.item.id);
  const canGoToTask = canSubmit && availableProcessTasks.includes(taskId || '');
  const navigateToTask = () => {
    if (canGoToTask) {
      processNext({ taskId });
    }
  };

  return (
    <WrappedButton
      disabled={!canGoToTask}
      busyWithId={busyWithId}
      message={message}
      onClick={navigateToTask}
      nodeId={props.node.item.id}
      {...props}
      variant={'outline'}
    >
      {children}
    </WrappedButton>
  );
};
