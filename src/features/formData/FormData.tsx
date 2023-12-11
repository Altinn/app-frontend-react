import React from 'react';
import type { PropsWithChildren } from 'react';

import { FormDataForInfoTaskProvider } from 'src/features/formData/FormDataReadOnly';
import { FormDataReadWriteProvider } from 'src/features/formData/FormDataReadWrite';
import { useTaskType } from 'src/features/instance/ProcessContext';
import { useNavigationParams } from 'src/hooks/useNavigatePage';
import { ProcessTaskType } from 'src/types';

export function FormDataProvider({ children }: PropsWithChildren) {
  const { taskId } = useNavigationParams();
  const taskType = useTaskType(taskId);
  const isDataTask = taskType === ProcessTaskType.Data;
  const isInfoTask =
    taskType === ProcessTaskType.Confirm ||
    taskType === ProcessTaskType.Feedback ||
    taskType === ProcessTaskType.Archived;

  if (isDataTask) {
    return <FormDataReadWriteProvider>{children}</FormDataReadWriteProvider>;
  }

  if (isInfoTask) {
    return <FormDataForInfoTaskProvider taskId={taskId}>{children}</FormDataForInfoTaskProvider>;
  }

  return <>{children}</>;
}
