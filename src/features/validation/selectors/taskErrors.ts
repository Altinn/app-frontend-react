import { useMemo, useRef } from 'react';

import deepEqual from 'fast-deep-equal';

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
    if (!visibleNodes) {
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

    const taskValidations = selector('taskValidations', (state) => state.state.task);
    const allShown = selector('allFieldsIfShown', (state) => {
      if (state.showAllErrors) {
        return { fields: state.state.fields };
      }
      return undefined;
    });
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

/**
 * Utility hook for preventing rerendering unless visible nodes actually change
 */
function useVisibleNodes() {
  const nodes = useNodes();
  const visibleNodes = useMemo(() => nodes.allNodes().filter(shouldValidateNode), [nodes]);
  const visibleNodesRef = useRef(visibleNodes);

  if (
    visibleNodes === visibleNodesRef.current ||
    deepEqual(
      visibleNodes.map((n) => n.item.id),
      visibleNodesRef.current.map((n) => n.item.id),
    )
  ) {
    return visibleNodesRef.current;
  } else {
    visibleNodesRef.current = visibleNodes;
    return visibleNodes;
  }
}
