import { useMemo } from 'react';

import { ContextNotProvided } from 'src/core/contexts/context';
import { getVisibilityMask, selectValidations, validationsOfSeverity } from 'src/features/validation/utils';
import { Validation } from 'src/features/validation/validationContext';
import { NodesInternal } from 'src/utils/layout/NodesContext';
import type { AnyValidation, BaseValidation, NodeRefValidation } from 'src/features/validation/index';

const emptyArray: never[] = [];

/**
 * Returns all validation errors (not warnings, info, etc.) for a layout set.
 * This includes unmapped/task errors as well
 */
export function useTaskErrors(): {
  formErrors: NodeRefValidation<AnyValidation<'error'>>[];
  taskErrors: BaseValidation<'error'>[];
} {
  const selector = Validation.useSelector();
  const _formErrors = NodesInternal.useAllValidations('visible', 'error');
  const formErrors = _formErrors === ContextNotProvided ? emptyArray : _formErrors;

  const taskErrors = useMemo(() => {
    const taskErrors: BaseValidation<'error'>[] = [];

    const taskValidations = selector((state) => state.state.task, []);
    const allShown = selector(
      (state) => (state.showAllErrors ? { dataModels: state.state.dataModels } : undefined),
      [],
    );
    if (allShown) {
      const backendMask = getVisibilityMask(['Backend', 'CustomBackend']);
      for (const fields of Object.values(allShown.dataModels)) {
        for (const field of Object.values(fields)) {
          taskErrors.push(...(selectValidations(field, backendMask, 'error') as BaseValidation<'error'>[]));
        }
      }
    }

    for (const validation of validationsOfSeverity(taskValidations, 'error')) {
      taskErrors.push(validation);
    }

    return taskErrors;
  }, [selector]);

  return useMemo(() => ({ formErrors, taskErrors }), [formErrors, taskErrors]);
}
