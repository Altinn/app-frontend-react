import { useMemo } from 'react';

import { useAttachments } from 'src/features/attachments/AttachmentsContext';
import { FD } from 'src/features/formData/FormDataWrite';
import { useCurrentLanguage } from 'src/features/language/LanguageProvider';
import { implementsAnyValidation, implementsValidateComponent, implementsValidateEmptyField } from 'src/layout';
import { useNodes } from 'src/utils/layout/NodesContext';
import type { ComponentValidations, ValidationDataSources } from 'src/features/validation';

const __default__ = {};

/**
 * Runs validations defined in the component classes
 */
export function useNodeValidation(): ComponentValidations {
  const validationDataSources = useValidationDataSources();

  return useMemo(() => {
    const nodes = validationDataSources.nodes.allNodes();
    const nodesToValidate = nodes.filter(
      (node) => implementsAnyValidation(node.def) && !('renderAsSummary' in node.item && node.item.renderAsSummary),
    );

    if (nodesToValidate.length === 0) {
      return __default__;
    }

    const validations: ComponentValidations = {};
    for (const node of nodesToValidate) {
      const id = node.getId();
      validations[id] = {
        component: [],
        bindingKeys: node.item.dataModelBindings
          ? Object.fromEntries(Object.keys(node.item.dataModelBindings).map((key) => [key, []]))
          : {},
      };

      /**
       * Run required validation
       */
      if (implementsValidateEmptyField(node.def)) {
        const item = node.item as any;
        const validations = node.def.runEmptyFieldValidation(node as any, item, validationDataSources);
        for (const validation of validations) {
          if (validation.bindingKey) {
            validations[id].bindingKeys[validation.bindingKey].push(validation);
          } else {
            validations[id].component.push(validation);
          }
        }
      }

      /**
       * Run component validation
       */
      if (implementsValidateComponent(node.def)) {
        const item = node.item as any;
        const validations = node.def.runComponentValidation(node as any, item, validationDataSources);
        for (const validation of validations) {
          if (validation.bindingKey) {
            validations[id].bindingKeys[validation.bindingKey].push(validation);
          } else {
            validations[id].component.push(validation);
          }
        }
      }
    }
    return validations;
  }, [validationDataSources]);
}

/**
 * Hook providing validation data sources
 */
export function useValidationDataSources(): ValidationDataSources {
  const formData = FD.useDebounced();
  const attachments = useAttachments();
  const currentLanguage = useCurrentLanguage();
  const nodes = useNodes();

  return useMemo(
    () => ({
      formData,
      attachments,
      currentLanguage,
      nodes,
    }),
    [attachments, currentLanguage, formData, nodes],
  );
}
