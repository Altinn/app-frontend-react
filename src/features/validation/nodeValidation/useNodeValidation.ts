import { useMemo } from 'react';

import { useAttachments } from 'src/features/attachments/AttachmentsContext';
import { FD } from 'src/features/formData/FormDataWrite';
import { useCurrentLanguage } from 'src/features/language/LanguageProvider';
import { implementsValidateComponent, implementsValidateEmptyField } from 'src/layout';
import { NodeGeneratorInternal } from 'src/utils/layout/NodesGeneratorContext';
import type { ComponentValidation, ValidationDataSources } from 'src/features/validation';
import type { LayoutNode } from 'src/utils/layout/LayoutNode';

const __default__ = [];

/**
 * Runs validations defined in the component classes
 */
export function useNodeValidation(node: LayoutNode): ComponentValidation[] {
  const validationDataSources = useValidationDataSources();
  const item = NodeGeneratorInternal.useItem();

  return useMemo(() => {
    if (!item || ('renderAsSummary' in item && item.renderAsSummary)) {
      return __default__;
    }

    const validations: ComponentValidation[] = [];

    if (implementsValidateEmptyField(node.def)) {
      validations.push(...node.def.runEmptyFieldValidation(node as any, item as any, validationDataSources));
    }

    if (implementsValidateComponent(node.def)) {
      validations.push(...node.def.runComponentValidation(node as any, item as any, validationDataSources));
    }
    return validations;
  }, [item, node, validationDataSources]);
}

/**
 * Hook providing validation data sources
 */
export function useValidationDataSources(): ValidationDataSources {
  const formData = FD.useDebounced();
  const invalidData = FD.useInvalidDebounced();
  const attachments = useAttachments();
  const currentLanguage = useCurrentLanguage();

  return useMemo(
    () => ({
      formData,
      invalidData,
      attachments,
      currentLanguage,
    }),
    [attachments, currentLanguage, formData, invalidData],
  );
}
