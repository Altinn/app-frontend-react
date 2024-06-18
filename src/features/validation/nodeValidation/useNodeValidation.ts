import { useMemo } from 'react';

import { useAttachmentsSelector } from 'src/features/attachments/hooks';
import { FD } from 'src/features/formData/FormDataWrite';
import { useCurrentLanguage } from 'src/features/language/LanguageProvider';
import { Validation } from 'src/features/validation/validationContext';
import { implementsValidateComponent, implementsValidateEmptyField } from 'src/layout';
import { NodesInternal } from 'src/utils/layout/NodesContext';
import type { AnyValidation, ValidationDataSources } from 'src/features/validation';
import type { LayoutNode } from 'src/utils/layout/LayoutNode';

/**
 * Runs validations defined in the component classes. This runs from the node generator, and will collect all
 * validations for a node and return them.
 */
export function useNodeValidation(node: LayoutNode, shouldValidate: boolean): AnyValidation[] {
  const fieldSelector = Validation.useFieldSelector();
  const validationDataSources = useValidationDataSources();

  return useMemo(() => {
    const validations: AnyValidation[] = [];
    if (!shouldValidate) {
      return validations;
    }

    if (implementsValidateEmptyField(node.def)) {
      validations.push(...node.def.runEmptyFieldValidation(node as any, validationDataSources));
    }

    if (implementsValidateComponent(node.def)) {
      validations.push(...node.def.runComponentValidation(node as any, validationDataSources));
    }

    const dataModelBindings = validationDataSources.nodeDataSelector(
      (picker) => picker(node)?.layout.dataModelBindings,
      [node],
    );
    if (dataModelBindings) {
      for (const [bindingKey, _field] of Object.entries(dataModelBindings)) {
        const field = _field as string;
        const fieldValidations = fieldSelector((fields) => fields[field], [field]);
        if (fieldValidations) {
          validations.push(...fieldValidations.map((v) => ({ ...v, node, bindingKey })));
        }
      }
    }

    return validations;
  }, [node, fieldSelector, shouldValidate, validationDataSources]);
}

/**
 * Hook providing validation data sources
 */
function useValidationDataSources(): ValidationDataSources {
  const formDataSelector = FD.useDebouncedSelector();
  const invalidDataSelector = FD.useInvalidDebouncedSelector();
  const attachmentsSelector = useAttachmentsSelector();
  const currentLanguage = useCurrentLanguage();
  const nodeSelector = NodesInternal.useNodeDataSelector();

  return useMemo(
    () => ({
      formDataSelector,
      invalidDataSelector,
      attachmentsSelector,
      currentLanguage,
      nodeDataSelector: nodeSelector,
    }),
    [attachmentsSelector, currentLanguage, formDataSelector, invalidDataSelector, nodeSelector],
  );
}
