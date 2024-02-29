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

/**
 * Returns all validation errors (not warnings, info, etc.) for a layout set.
 * This includes unmapped/task errors as well
 */
export function useTaskErrors(): {
  formErrors: NodeValidation<'error'>[];
  taskErrors: BaseValidation<'error'>[];
} {
  const pages = useNodes();
  const selector = Validation.useSelector();
  const visibilitySelector = Validation.useVisibilitySelector();

  return useMemo(() => {
    if (!pages) {
      return { formErrors: [], taskErrors: [] };
    }
    const formErrors: NodeValidation<'error'>[] = [];
    const taskErrors: BaseValidation<'error'>[] = [];

    for (const node of pages.allNodes().filter(shouldValidateNode)) {
      formErrors.push(
        ...getValidationsForNode(node, selector, getVisibilityForNode(node, visibilitySelector), 'error'),
      );
    }

    const allShown = selector('allFieldsIfShown', (state) => {
      if (state.showAllErrors) {
        return { fields: state.state.fields, task: state.state.task };
      }
      return undefined;
    });
    if (allShown) {
      const backendMask = getVisibilityMask(['Backend', 'CustomBackend']);
      for (const field of Object.values(allShown.fields)) {
        taskErrors.push(...(selectValidations(field, backendMask, 'error') as BaseValidation<'error'>[]));
      }
      for (const validation of validationsOfSeverity(allShown.task, 'error')) {
        taskErrors.push(validation);
      }
    }
    return { formErrors, taskErrors };
  }, [pages, selector, visibilitySelector]);
}
