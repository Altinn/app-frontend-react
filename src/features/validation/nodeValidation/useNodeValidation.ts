import { useMemo } from 'react';

import { useApplicationMetadata } from 'src/features/applicationMetadata/ApplicationMetadataProvider';
import { useAttachmentsSelector } from 'src/features/attachments/hooks';
import { DataModels } from 'src/features/datamodel/DataModelsProvider';
import { useLayoutSets } from 'src/features/form/layoutSets/LayoutSetsProvider';
import { FD } from 'src/features/formData/FormDataWrite';
import { useLaxInstanceAllDataElements } from 'src/features/instance/InstanceContext';
import { useCurrentLanguage } from 'src/features/language/LanguageProvider';
import { Validation } from 'src/features/validation/validationContext';
import { implementsValidateComponent, implementsValidateEmptyField, implementsValidateSchema } from 'src/layout';
import { NodesInternal } from 'src/utils/layout/NodesContext';
import type { AnyValidation, ComponentValidation, ValidationsProcessedLast } from 'src/features/validation';
import type { IDataModelReference } from 'src/layout/common.generated';
import type { LayoutNode } from 'src/utils/layout/LayoutNode';

const emptyArray = [];
/**
 * Runs validations defined in the component classes. This runs from the node generator, and will collect all
 * validations for a node and return them.
 */
export function useNodeValidation(
  node: LayoutNode,
  shouldValidate: boolean,
): { validations: AnyValidation[]; processedLast: ValidationsProcessedLast } {
  const formDataSelector = FD.useDebouncedSelector();
  const invalidDataSelector = FD.useInvalidDebouncedSelector();
  const attachmentsSelector = useAttachmentsSelector();
  const currentLanguage = useCurrentLanguage();
  const nodeDataSelector = NodesInternal.useNodeDataSelector();
  const applicationMetadata = useApplicationMetadata();
  const dataElements = useLaxInstanceAllDataElements();
  const layoutSets = useLayoutSets();
  const dataElementHasErrorsSelector = Validation.useDataElementHasErrorsSelector();
  const getSchemaValidator = DataModels.useGetSchemaValidator();
  const dataModelValidationsSelector = Validation.useDataModelSelector();
  const getDataElementIdForDataType = DataModels.useGetDataElementIdForDataType();
  const processedLast = Validation.useProcessedLast();

  const emptyFieldValidations = useMemo(() => {
    if (!shouldValidate || !implementsValidateEmptyField(node.def)) {
      return emptyArray;
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const validations = node.def.runEmptyFieldValidation(node as any, {
      formDataSelector,
      nodeDataSelector,
      invalidDataSelector,
    });
    return validations.length ? validations : emptyArray;
  }, [formDataSelector, invalidDataSelector, node, nodeDataSelector, shouldValidate]);

  const componentValidations = useMemo(() => {
    if (!shouldValidate || !implementsValidateComponent(node.def)) {
      return emptyArray;
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const validations = node.def.runComponentValidation(node as any, {
      formDataSelector,
      invalidDataSelector,
      attachmentsSelector,
      nodeDataSelector,
      applicationMetadata,
      currentLanguage,
      dataElements,
      dataElementHasErrorsSelector,
      layoutSets,
    });

    return validations.length ? validations : emptyArray;
  }, [
    applicationMetadata,
    attachmentsSelector,
    currentLanguage,
    dataElementHasErrorsSelector,
    dataElements,
    formDataSelector,
    invalidDataSelector,
    layoutSets,
    node,
    nodeDataSelector,
    shouldValidate,
  ]);

  const schemaValidations = useMemo(() => {
    if (!shouldValidate || !implementsValidateSchema(node.def)) {
      return emptyArray;
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const validations = node.def.runSchemaValidation(node as any, {
      formDataSelector,
      nodeDataSelector,
      getSchemaValidator,
    });
    return validations.length ? validations : emptyArray;
  }, [formDataSelector, getSchemaValidator, node, nodeDataSelector, shouldValidate]);

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
      const fieldValidations = dataModelValidationsSelector(
        (dataModels) => dataModels[dataElementId]?.[field],
        [dataType, field],
      );
      if (fieldValidations) {
        validations.push(...fieldValidations.map((v) => ({ ...v, bindingKey })));
      }
    }
    return validations.length ? validations : emptyArray;
  }, [dataModelValidationsSelector, getDataElementIdForDataType, node, nodeDataSelector, shouldValidate]);

  return {
    processedLast,
    validations: useMemo(() => {
      if (!shouldValidate) {
        return emptyArray;
      }

      const validations = [
        ...emptyFieldValidations,
        ...componentValidations,
        ...schemaValidations,
        ...backendValidations,
      ];

      return validations.length ? validations : emptyArray;
    }, [backendValidations, componentValidations, emptyFieldValidations, schemaValidations, shouldValidate]),
  };
}
