import React from 'react';

import Confirm from 'src/features/confirm/containers/Confirm';
import Feedback from 'src/features/feedback/Feedback';
import { Form } from 'src/features/form/containers/Form';
import Receipt from 'src/features/receipt/containers/ReceiptContainer';
import { ProcessTaskType } from 'src/types';

const components = {
  [ProcessTaskType.Data]: Form,
  [ProcessTaskType.Archived]: Receipt,
  [ProcessTaskType.Confirm]: Confirm,
  [ProcessTaskType.Feedback]: Feedback,
};
export const ProcessComponent = function ({
  taskType,
  loading,
}: {
  taskType: ProcessTaskType;
  loading: boolean;
}) {
  if (loading !== false) {
    return null;
  }
  const Component = components[taskType];
  return <Component />;
};
