import { useMemo } from 'react';

import type { ComponentValidation, NodeValidation } from '..';

import { filterValidations, selectValidations } from 'src/features/validation/utils';
import { NodesInternal } from 'src/utils/layout/NodesContext';
import type { LayoutNode } from 'src/utils/layout/LayoutNode';

/**
 * Get only the component validations which are not bound to any data model fields.
 */
export function useComponentValidationsForNode(node: LayoutNode): NodeValidation<ComponentValidation>[] {
  const mask = NodesInternal.useValidationVisibility(node);
  const component = NodesInternal.useValidations(node);

  return useMemo(() => {
    const notBound = component.filter((v) => !('bindingKey' in v));
    const validations = filterValidations(selectValidations(notBound, mask), node);
    return validations.map((validation) => ({ ...validation, node }));
  }, [component, mask, node]);
}
