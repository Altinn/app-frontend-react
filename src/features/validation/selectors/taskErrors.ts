import { useMemo } from 'react';

import type { AnyValidation, BaseValidation, NodeValidation } from '..';

import {
  filterValidations,
  getVisibilityMask,
  selectValidations,
  validationsOfSeverity,
} from 'src/features/validation/utils';
import { Validation } from 'src/features/validation/validationContext';
import { NodesInternal, useNodes } from 'src/utils/layout/NodesContext';

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
  const nodes = useNodes();
  const nodeValidationsSelector = NodesInternal.useValidationsSelector();

  const formErrors = useMemo(() => {
    if (!nodes) {
      return emptyArray;
    }

    const formErrors: NodeValidation<AnyValidation<'error'>>[] = [];
    for (const node of nodes.allNodes()) {
      const mask = visibilitySelector(node);
      const validations = nodeValidationsSelector(node);
      const selected = selectValidations(validations, mask, 'error');
      const filtered = filterValidations(selected, node) as AnyValidation<'error'>[];
      formErrors.push(...filtered.map((v) => ({ ...v, node })));
    }

    return formErrors;
  }, [nodeValidationsSelector, nodes, visibilitySelector]);

  const taskErrors = useMemo(() => {
    const taskErrors: BaseValidation<'error'>[] = [];

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

    return taskErrors;
  }, [selector]);

  return useMemo(() => ({ formErrors, taskErrors }), [formErrors, taskErrors]);
}
