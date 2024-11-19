import { useRef } from 'react';

import deepEqual from 'fast-deep-equal';

import { Validation } from 'src/features/validation/validationContext';
import { implementsValidateComponent, implementsValidateEmptyField } from 'src/layout';
import { GeneratorInternal } from 'src/utils/layout/generator/GeneratorContext';
import { GeneratorData } from 'src/utils/layout/generator/GeneratorDataSources';
import { NodesInternal } from 'src/utils/layout/NodesContext';
import type { AnyValidation, BaseValidation } from 'src/features/validation';
import type { CompDef, ValidationFilter } from 'src/layout';
import type { IDataModelReference } from 'src/layout/common.generated';
import type { LayoutNode } from 'src/utils/layout/LayoutNode';
import type { NodeDataSelector } from 'src/utils/layout/NodesContext';

const emptyArray: AnyValidation[] = [];

/**
 * Runs validations defined in the component classes. This runs from the node generator, and will collect all
 * validations for a node and return them.
 */
export function useNodeValidation(node: LayoutNode, shouldValidate: boolean): AnyValidation[] {
  const registry = GeneratorInternal.useRegistry();
  const validationDataSources = GeneratorData.useValidationDataSources();
  const nodeDataSelector = NodesInternal.useNodeDataSelector();
  const getDataElementIdForDataType = GeneratorData.useGetDataElementIdForDataType();
  const dataModelBindings = GeneratorInternal.useIntermediateItem()?.dataModelBindings;

  const validationDataSourcesRef = useRef(validationDataSources);
  const prevValue = useRef<AnyValidation[] | undefined>(undefined);

  return Validation.useFullState((state) => {
    if (!shouldValidate) {
      return emptyArray;
    }
    const prevProcessedLast = registry.current.validationsProcessed[node.id];
    const reSelectFromValidationState = prevProcessedLast
      ? prevProcessedLast.initial !== state.processedLast.initial ||
        prevProcessedLast.incremental !== state.processedLast.incremental
      : true;
    const reSelectFromNode = validationDataSourcesRef.current !== validationDataSources;
    if (!reSelectFromNode && !reSelectFromValidationState && prevValue.current) {
      // This runs every time the validation context changes. For performance reasons we want to avoid running all
      // validations unless the state we care about has changed (or, if the data sources have changed).
      return prevValue.current;
    }

    const validations: AnyValidation[] = [];
    if (implementsValidateEmptyField(node.def)) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      validations.push(...node.def.runEmptyFieldValidation(node as any, validationDataSources));
    }

    if (implementsValidateComponent(node.def)) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      validations.push(...node.def.runComponentValidation(node as any, validationDataSources));
    }

    for (const [bindingKey, { dataType, field }] of Object.entries(
      (dataModelBindings ?? {}) as Record<string, IDataModelReference>,
    )) {
      const dataElementId = getDataElementIdForDataType(dataType) ?? dataType; // stateless does not have dataElementId
      const fieldValidations = state.state.dataModels[dataElementId]?.[field];
      if (fieldValidations) {
        validations.push(...fieldValidations.map((v) => ({ ...v, bindingKey })));
      }
    }

    const out = filter(validations, node, nodeDataSelector);
    registry.current.validationsProcessed[node.id] = state.processedLast;
    validationDataSourcesRef.current = validationDataSources;

    if (prevValue.current && deepEqual(prevValue.current, out)) {
      return prevValue.current;
    }

    prevValue.current = out;
    return out;
  });
}

/**
 * Filters a list of validations based on the validation filters of a node
 */
function filter<Validation extends BaseValidation>(
  validations: Validation[],
  node: LayoutNode,
  selector: NodeDataSelector,
): Validation[] {
  if (!implementsValidationFilter(node.def)) {
    return validations;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const filters = node.def.getValidationFilters(node as any, selector);
  if (filters.length == 0) {
    return validations;
  }

  const out: Validation[] = [];
  validationsLoop: for (let i = 0; i < validations.length; i++) {
    for (const filter of filters) {
      if (!filter(validations[i], i, validations)) {
        // Skip validation if any filter returns false
        continue validationsLoop;
      }
    }
    out.push(validations[i]);
  }
  return out;
}

function implementsValidationFilter<Def extends CompDef>(def: Def): def is Def & ValidationFilter {
  return 'getValidationFilters' in def;
}
