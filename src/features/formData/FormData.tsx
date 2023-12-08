import React from 'react';
import type { PropsWithChildren } from 'react';

import { FormDataReadWriteProvider } from 'src/features/formData/FormDataRead';
import { FormDataForInfoTaskProvider } from 'src/features/formData/FormDataReadOnly';
import { useRealTaskType } from 'src/features/instance/ProcessContext';
import { ProcessTaskType } from 'src/types';

export function FormDataProvider({ children }: PropsWithChildren) {
  const taskType = useRealTaskType();
  const isDataTask = taskType === ProcessTaskType.Data;
  const isInfoTask =
    taskType === ProcessTaskType.Confirm ||
    taskType === ProcessTaskType.Feedback ||
    taskType === ProcessTaskType.Archived;

  if (isDataTask) {
    return <FormDataReadWriteProvider>{children}</FormDataReadWriteProvider>;
  }

  if (isInfoTask) {
    return <FormDataForInfoTaskProvider>{children}</FormDataForInfoTaskProvider>;
  }

  return <>{children}</>;
}
