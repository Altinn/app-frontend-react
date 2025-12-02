import { useEffect } from 'react';

import { useTaskTypeFromBackend } from 'src/features/instance/useProcessQuery';
import { useLanguage } from 'src/features/language/useLanguage';
import { ProcessTaskType } from 'src/types';
import { NodesInternal } from 'src/utils/layout/NodesContext';
import type { NodeValidationProps } from 'src/layout/layout';

type Props = NodeValidationProps<'SigningActions' | 'SigningDocumentList' | 'SigneeList'>;

export function ValidateSigningTaskType(props: Props) {
  const taskType = useTaskTypeFromBackend();
  const addError = NodesInternal.useAddError();
  const { langAsString } = useLanguage();
  const error = langAsString('signing.wrong_task_error', [props.intermediateItem.type]);

  useEffect(() => {
    if (taskType !== ProcessTaskType.Signing) {
      addError(error, props.intermediateItem.id, 'node');
      window.logErrorOnce(`Validation error for '${props.intermediateItem.id}': ${error}`);
    }
  }, [addError, error, props.intermediateItem.id, props.intermediateItem.type, taskType]);

  return null;
}
