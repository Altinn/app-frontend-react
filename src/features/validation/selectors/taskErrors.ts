import { useMemo } from 'react';

import type { AnyValidation, BaseValidation, NodeValidation } from '..';

import { getVisibilityMask, selectValidations, validationsOfSeverity } from 'src/features/validation/utils';
import { Validation } from 'src/features/validation/validationContext';
import { NodesInternal } from 'src/utils/layout/NodesContext';
import { useNodeTraversalSelectorSilent } from 'src/utils/layout/useNodeTraversal';

const emptyArray: [] = [];

/**
 * Returns all validation errors (not warnings, info, etc.) for a layout set.
 * This includes unmapped/task errors as well
 */
export function useTaskErrors(): {
  formErrors: NodeValidation<AnyValidation<'error'>>[];
  taskErrors: BaseValidation<'error'>[];
} {
  const selector = Validation.useSelector();
  const visibilitySelector = NodesInternal.useValidationVisibilitySelector();
  const nodeValidationsSelector = NodesInternal.useValidationsSelector();
  const traversalSelector = useNodeTraversalSelectorSilent();

  const formErrors = useMemo(() => {
    if (!traversalSelector) {
      return emptyArray;
    }

    const formErrors: NodeValidation<AnyValidation<'error'>>[] = [];
    const allNodes = traversalSelector((t) => t?.allNodes(), []);
    for (const node of allNodes ?? emptyArray) {
      const mask = visibilitySelector(node);
      const validations = nodeValidationsSelector(node);
      const selected = selectValidations(validations, mask, 'error') as AnyValidation<'error'>[];
      formErrors.push(...selected.map((v) => ({ ...v, node })));
    }

    return formErrors;
  }, [nodeValidationsSelector, traversalSelector, visibilitySelector]);

  const taskErrors = useMemo(() => {
    const taskErrors: BaseValidation<'error'>[] = [];

    const taskValidations = selector((state) => state.state.task, []);
    const allShown = selector((state) => {
      if (state.showAllErrors) {
        return { fields: state.state.fields };
      }
      return undefined;
    }, []);
    if (allShown) {
      const backendMask = getVisibilityMask(['Backend', 'CustomBackend']);
      for (const field of Object.values(allShown.fields)) {
        taskErrors.push(...(selectValidations(field, backendMask, 'error') as BaseValidation<'error'>[]));
      }
    }

    for (const validation of validationsOfSeverity(taskValidations, 'error')) {
      taskErrors.push(validation);
    }

    return taskErrors;
  }, [selector]);

  return useMemo(() => ({ formErrors, taskErrors }), [formErrors, taskErrors]);
}
