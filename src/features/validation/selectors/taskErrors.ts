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
  const nodeValidationsSelector = NodesInternal.useValidationsSelector();
  const traversalSelector = useNodeTraversalSelectorSilent();

  const [formErrors, mappedValidations] = useMemo(() => {
    if (!traversalSelector) {
      return [emptyArray, null];
    }

    const formErrors: NodeValidation<AnyValidation<'error'>>[] = [];
    const mappedValidations = new Set<AnyValidation>();
    const allNodes = traversalSelector((t) => t.allNodes(), []);
    for (const node of allNodes ?? emptyArray) {
      const validations = nodeValidationsSelector(node, 'visible', 'error') as AnyValidation<'error'>[];
      formErrors.push(...validations.map((v) => ({ ...v, node })));
      validations.forEach((validation) => mappedValidations.add(validation));
    }

    return [formErrors, mappedValidations];
  }, [nodeValidationsSelector, traversalSelector]);

  const unmappedErrors = useMemo(() => {
    if (!selector((state) => state.showAllErrors, [])) {
      return emptyArray;
    }

    const unmappedErrors: BaseValidation[] = [];

    // Only show unmapped backend errors
    // TODO: There is an issue the data model in frontend-test causing json schema errors with const on `orid` fields,
    // investigate whether this can have an impact on other apps or if we can show all unmapped errors here.
    const mask = getVisibilityMask(['Backend', 'CustomBackend']);
    const dataModels = selector((state) => state.state.dataModels, []);
    for (const fields of Object.values(dataModels)) {
      for (const field of Object.values(fields)) {
        unmappedErrors.push(
          ...selectValidations(field, mask, 'error').filter(
            (validation) => !mappedValidations || !mappedValidations.has(validation),
          ),
        );
      }
    }

    return unmappedErrors;
  }, [mappedValidations, selector]);

  const taskErrors = useMemo(
    () => [
      ...validationsOfSeverity(unmappedErrors, 'error'),
      ...validationsOfSeverity(
        selector((state) => state.state.task, []),
        'error',
      ),
    ],
    [selector, unmappedErrors],
  );

  return useMemo(() => ({ formErrors, taskErrors }), [formErrors, taskErrors]);
}
