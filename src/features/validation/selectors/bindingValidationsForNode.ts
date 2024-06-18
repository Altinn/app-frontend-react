import { useMemo } from 'react';

import type { ComponentValidation, FieldValidation, NodeValidation } from '..';

import { selectValidations } from 'src/features/validation/utils';
import { NodesInternal } from 'src/utils/layout/NodesContext';
import { useNodeItem } from 'src/utils/layout/useNodeItem';
import type { CompTypes, IDataModelBindings } from 'src/layout/layout';
import type { BaseLayoutNode, LayoutNode } from 'src/utils/layout/LayoutNode';

type OutValues = NodeValidation<ComponentValidation | FieldValidation>[];

/**
 * Gets all validations that are bound to a data model field,
 * including component validations which have a binding key association.
 */
export function useBindingValidationsForNode<
  N extends LayoutNode,
  T extends CompTypes = N extends BaseLayoutNode<infer T> ? T : never,
>(node: N): { [binding in keyof NonNullable<IDataModelBindings<T>>]: OutValues } | undefined {
  const mask = NodesInternal.useValidationVisibility(node);
  const component = NodesInternal.useValidations(node);
  const dataModelBindings = useNodeItem(node).dataModelBindings;

  return useMemo(() => {
    if (!dataModelBindings) {
      return undefined;
    }

    const bindingValidations: { [bindingKey: string]: OutValues } = {};
    for (const bindingKey of Object.keys(dataModelBindings)) {
      bindingValidations[bindingKey] = [];

      const componentValidations = component.filter(
        (v) => 'bindingKey' in v && v.bindingKey === bindingKey,
      ) as ComponentValidation[];
      const validations = selectValidations(componentValidations, mask);
      bindingValidations[bindingKey].push(...validations.map((validation) => ({ ...validation, bindingKey, node })));
    }
    return bindingValidations as {
      [binding in keyof NonNullable<IDataModelBindings<T>>]: OutValues;
    };
  }, [component, mask, node, dataModelBindings]);
}
