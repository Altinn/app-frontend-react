import { useMemo } from 'react';

import { DataModels } from 'src/features/datamodel/DataModelsProvider';
import { Validation } from 'src/features/validation/validationContext';
import { implementsValidateComponent, implementsValidateEmptyField } from 'src/layout';
import { useNodeDataSources } from 'src/utils/layout/generator/NodeDataSourcesProvider';
import type {
  AnyValidation,
  BaseValidation,
  ComponentValidation,
  ValidationsProcessedLast,
} from 'src/features/validation';
import type { CompDef, ValidationFilter } from 'src/layout';
import type { IDataModelReference } from 'src/layout/common.generated';
import type { LayoutNode } from 'src/utils/layout/LayoutNode';
import type { NodeDataSelector } from 'src/utils/layout/NodesContext';

/**
 * Runs validations defined in the component classes. This runs from the node generator, and will collect all
 * validations for a node and return them.
 */
export function useNodeValidation(
  node: LayoutNode,
  shouldValidate: boolean,
): { validations: AnyValidation[]; processedLast: ValidationsProcessedLast } {
  const {
    formDataSelector,
    invalidDataSelector,
    attachmentsSelector,
    currentLanguage,
    nodeDataSelector,
    applicationMetadata,
    dataElements,
    layoutSets,
  } = useNodeDataSources();

  const dataElementHasErrorsSelector = Validation.useDataElementHasErrorsSelector();
  const dataModelSelector = Validation.useDataModelSelector();
  const getDataElementIdForDataType = DataModels.useGetDataElementIdForDataType();
  const processedLast = Validation.useProcessedLast();

  const emptyFieldValidations = useMemo(() => {
    if (!shouldValidate) {
      return emptyArray;
    }

    if (implementsValidateEmptyField(node.def)) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const validations = node.def.runEmptyFieldValidation(node as any, {
        formDataSelector,
        invalidDataSelector,
        nodeDataSelector,
      });

      return validations.length ? validations : emptyArray;
    }

    return emptyArray;
  }, [formDataSelector, invalidDataSelector, node, nodeDataSelector, shouldValidate]);

  const componentValidations = useMemo(() => {
    if (!shouldValidate) {
      return emptyArray;
    }

    if (implementsValidateComponent(node.def)) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const validations = node.def.runComponentValidation(node as any, {
        formDataSelector,
        attachmentsSelector,
        currentLanguage,
        nodeDataSelector,
        applicationMetadata,
        dataElements,
        layoutSets,
        dataElementHasErrorsSelector,
      });

      return validations.length ? validations : emptyArray;
    }

    return emptyArray;
  }, [
    applicationMetadata,
    attachmentsSelector,
    currentLanguage,
    dataElementHasErrorsSelector,
    dataElements,
    formDataSelector,
    layoutSets,
    node,
    nodeDataSelector,
    shouldValidate,
  ]);

  const backendValidations = useMemo(() => {
    if (!shouldValidate) {
      return emptyArray;
    }

    const validations: ComponentValidation[] = [];

    const dataModelBindings = nodeDataSelector((picker) => picker(node)?.layout.dataModelBindings, [node]);
    for (const [bindingKey, { dataType, field }] of Object.entries(
      (dataModelBindings ?? {}) as Record<string, IDataModelReference>,
    )) {
      const dataElementId = getDataElementIdForDataType(dataType) ?? dataType; // stateless does not have dataElementId
      const fieldValidations = dataModelSelector((dataModels) => dataModels[dataElementId]?.[field], [dataType, field]);
      if (fieldValidations) {
        validations.push(...fieldValidations.map((v) => ({ ...v, bindingKey })));
      }
    }

    return validations.length ? validations : emptyArray;
  }, [dataModelSelector, getDataElementIdForDataType, node, nodeDataSelector, shouldValidate]);

  return {
    processedLast,
    validations: useMemo(() => {
      if (!shouldValidate) {
        return emptyArray;
      }

      const validations = filter(
        [...emptyFieldValidations, ...componentValidations, ...backendValidations],
        node,
        nodeDataSelector,
      );

      return validations.length ? validations : emptyArray;
    }, [backendValidations, componentValidations, emptyFieldValidations, node, nodeDataSelector, shouldValidate]),
  };
}
const emptyArray = [];

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
