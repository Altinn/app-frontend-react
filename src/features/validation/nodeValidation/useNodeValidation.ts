import { useMemo } from 'react';

import { useAttachments } from 'src/features/attachments/AttachmentsContext';
import { FD } from 'src/features/formData/FormDataWrite';
import { useCurrentLanguage } from 'src/features/language/LanguageProvider';
import { Validation } from 'src/features/validation/validationContext';
import { implementsValidateComponent, implementsValidateEmptyField } from 'src/layout';
import { NodeGeneratorInternal } from 'src/utils/layout/NodesGeneratorContext';
import type { ComponentValidation, ValidationDataSources } from 'src/features/validation';
import type { LayoutNode } from 'src/utils/layout/LayoutNode';

/**
 * Runs validations defined in the component classes. This runs from the node generator, and will collect all
 * validations for a node and return them.
 */
export function useNodeValidation(node: LayoutNode, shouldValidate: boolean): ComponentValidation[] {
  const selector = Validation.useFieldSelector();
  const validationDataSources = useValidationDataSources();
  const item = NodeGeneratorInternal.useItem();

  return useMemo(() => {
    const validations: ComponentValidation[] = [];
    if (!item || !shouldValidate) {
      return validations;
    }

    if (implementsValidateEmptyField(node.def)) {
      validations.push(...node.def.runEmptyFieldValidation(node as any, item as any, validationDataSources));
    }

    if (implementsValidateComponent(node.def)) {
      validations.push(...node.def.runComponentValidation(node as any, item as any, validationDataSources));
    }

    if (item.dataModelBindings) {
      for (const [bindingKey, field] of Object.entries(item.dataModelBindings)) {
        const fieldValidations = selector((fields) => fields[field], [field]);
        if (fieldValidations) {
          validations.push(...fieldValidations.map((v) => ({ ...v, node, bindingKey })));
        }
      }
    }

    return validations;
  }, [item, node, selector, shouldValidate, validationDataSources]);
}

/**
 * Hook providing validation data sources
 */
function useValidationDataSources(): ValidationDataSources {
  const formDataSelector = FD.useDebouncedSelector();
  const invalidDataSelector = FD.useInvalidDebouncedSelector();
  const attachments = useAttachments();
  const currentLanguage = useCurrentLanguage();

  return useMemo(
    () => ({
      formDataSelector,
      invalidDataSelector,
      attachments,
      currentLanguage,
    }),
    [attachments, currentLanguage, formDataSelector, invalidDataSelector],
  );
}
