import React from 'react';
import { useNavigate } from 'react-router-dom';

import { ButtonVariant } from '@altinn/altinn-design-system';

import { useAppDispatch, useAppSelector } from 'src/common/hooks';
import { WrappedButton } from 'src/components/base/ButtonComponent/WrappedButton';
import { ProcessActions } from 'src/shared/resources/process/processSlice';
import { ProcessTaskType } from 'src/types';
import type { ButtonProps } from 'src/components/base/ButtonComponent/WrappedButton';
import type { IAltinnWindow } from 'src/types';

type props = Omit<ButtonProps, 'onClick'> & { taskId: string };

const altinnWindow = window as Window as IAltinnWindow;

export const GoToTaskButton = ({ children, taskId, ...props }: props) => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const availableProcessTasks = useAppSelector(
    (state) => state.process.availableNextTasks,
  );
  const canGoToTask =
    availableProcessTasks && availableProcessTasks.includes(taskId);
  const navigateToTask = () => {
    if (canGoToTask) {
      dispatch(
        ProcessActions.goToTask({
          taskId,
          processStep: ProcessTaskType.Unknown,
        }),
      );
      navigate(`/instance/${altinnWindow.instanceId}`, {
        replace: true,
        state: {},
      });
    }
  };
  return (
    <WrappedButton
      disabled={!canGoToTask}
      onClick={navigateToTask}
      {...props}
      variant={ButtonVariant.Secondary}
    >
      {children}
    </WrappedButton>
  );
};
