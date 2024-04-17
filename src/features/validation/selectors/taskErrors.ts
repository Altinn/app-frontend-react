import { useMemo } from 'react';

import type { BaseValidation, NodeValidation } from '..';

import {
  getValidationsForNode,
  getVisibilityMask,
  selectValidations,
  shouldValidateNode,
  validationsOfSeverity,
} from 'src/features/validation/utils';
import { Validation } from 'src/features/validation/validationContext';
import { getVisibilityForNode } from 'src/features/validation/visibility/visibilityUtils';
import { useNodes } from 'src/utils/layout/NodesContext';

const emptyArray: [] = [];

/**
 * Returns all validation errors (not warnings, info, etc.) for a layout set.
 * This includes unmapped/task errors as well
 */
export function useTaskErrors(): {
  formErrors: NodeValidation<'error'>[];
  taskErrors: BaseValidation<'error'>[];
} {
  const selector = Validation.useSelector();
  const visibilitySelector = Validation.useVisibilitySelector();
  const nodes = useNodes();

  const formErrors = useMemo(() => {
    if (!nodes) {
      return emptyArray;
    }

    const formErrors: NodeValidation<'error'>[] = [];
    for (const node of nodes.allNodes().filter(shouldValidateNode)) {
      formErrors.push(
        ...getValidationsForNode(node, selector, getVisibilityForNode(node, visibilitySelector), 'error'),
      );
    }

    return formErrors;
  }, [nodes, selector, visibilitySelector]);

  const taskErrors = useMemo(() => {
    const taskErrors: BaseValidation<'error'>[] = [];

    const taskValidations = selector('taskValidations', (state) => state.state.task);
    const allShown = selector('allFieldsIfShown', (state) => {
      if (state.showAllErrors) {
        return { dataModels: state.state.dataModels };
      }
      return undefined;
    });
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
