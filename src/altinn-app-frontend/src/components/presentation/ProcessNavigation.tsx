import React, { useState } from 'react';

import { useAppDispatch } from 'src/common/hooks';
import { WrappedButton } from 'src/components/base/ButtonComponent/WrappedButton';
import { ConfirmButton } from 'src/features/confirm/components/ConfirmButton';
import { ValidationActions } from 'src/features/form/validation/validationSlice';
import { ProcessActions } from 'src/shared/resources/process/processSlice';
import { getValidationUrl } from 'src/utils/appUrlHelper';
import { get } from 'src/utils/networking';
import { getTextFromAppOrDefault } from 'src/utils/textResource';
import { mapDataElementValidationToRedux } from 'src/utils/validation';
import type { IAltinnWindow } from 'src/types';

export const ProcessNavigation = ({ textResources, language }) => {
  const dispatch = useAppDispatch();
  // TODO: create saga to list next prcesses:
  const nextProcessTasks = {
    tasks: {
      allowedTask: {
        weight: 9,
        otherAttributes: 'may need to have more complexity later',
      },
      nextTask: {
        weight: 5,
      },
      illegalTask: {
        illegal_reason: 'invalid_role',
        weight: 0,
      },
    },
    availableTasks: ['nextTask', 'allowedTask', 'illegalTask'],
  };
  const [busyWithId, setBusyWithId] = useState<string>('');
  const confirmButtonId = 'confirm-button';
  const { instanceId } = window as Window as IAltinnWindow;

  const resetBusy = (id) => {
    console.log('did', id, ' sd ', busyWithId);
    if (busyWithId === id) {
      setBusyWithId('');
    }
    console.log('done', id, ' md ', busyWithId);
  };

  const handleConfirmClick = () => {
    if (busyWithId) {
      return;
    }
    setBusyWithId(confirmButtonId);
    get(getValidationUrl(instanceId))
      .then((data: any) => {
        const mappedValidations = mapDataElementValidationToRedux(
          data,
          {},
          textResources,
        );
        dispatch(
          ValidationActions.updateValidations({
            validations: mappedValidations,
          }),
        );
        if (data.length === 0) {
          dispatch(ProcessActions.complete());
        } else {
          resetBusy(confirmButtonId);
        }
      })
      .catch(() => {
        resetBusy(confirmButtonId);
      });
  };
  const handleGoToTaskClick = async ({ taskId, ...rest }) => {
    console.log(
      `You clicked go to ${taskId}! Not implemented: ${JSON.stringify(
        rest,
        null,
        ' ',
      )}`,
    );
  };
  const createSecondaryButtons = (busyWithId) => {
    return nextProcessTasks.availableTasks.map((taskId) => {
      const task = nextProcessTasks.tasks[taskId];
      // Check for overriding text in settings is currently not implemented TODO: create task for this implementation
      const text = getTextFromAppOrDefault(
        'navigation.go_to_task',
        textResources,
        language,
        [taskId],
      );
      const buttonId = `go-to-${taskId}`;
      return (
        <WrappedButton
          busyWithId={busyWithId}
          id={buttonId}
          key={taskId}
          onClick={() => {
            setBusyWithId(buttonId);
            handleGoToTaskClick({
              taskId,
              buttonId,
              ...task,
            }).finally(() => resetBusy(buttonId));
          }}
          language={language}
        >
          {text}
        </WrappedButton>
      );
    });
  };
  return (
    <div className={'process-navigation'}>
      <p>Busy with {busyWithId}</p>
      <ConfirmButton
        busyWithId={busyWithId}
        onClick={handleConfirmClick}
        language={language}
        id={confirmButtonId}
      />
      {createSecondaryButtons(busyWithId)}
    </div>
  );
};
