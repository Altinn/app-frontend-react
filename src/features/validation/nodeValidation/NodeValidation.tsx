import React, { useEffect, useMemo } from 'react';

import type { ComponentValidations, ValidationDataSources } from '..';

import { useAttachments } from 'src/features/attachments/AttachmentsContext';
import { useCurrentLanguage } from 'src/features/language/LanguageProvider';
import { Validation } from 'src/features/validation/validationContext';
import { useMemoDeepEqual } from 'src/hooks/useStateDeepEqual';
import { implementsAnyValidation, implementsValidateComponent, implementsValidateEmptyField } from 'src/layout';
import { useNodes } from 'src/utils/layout/NodesContext';
import type { CompTypes } from 'src/layout/layout';
import type { IComponentFormData } from 'src/utils/formComponentUtils';
import type { LayoutNode } from 'src/utils/layout/LayoutNode';

export function NodeValidation() {
  const nodes = useNodes().allNodes();
  const nodesToValidate = nodes.filter(
    (node) => implementsAnyValidation(node.def) && !('renderAsSummary' in node.item && node.item.renderAsSummary),
  );

  return (
    <>
      {nodesToValidate.map((node) => (
        <SpecificNodeValidation
          key={node.item.id}
          node={node}
        />
      ))}
    </>
  );
}

function SpecificNodeValidation<Type extends CompTypes>({ node }: { node: LayoutNode<Type> }) {
  const updateComponentValidations = Validation.useUpdateComponentValidations();
  const removeComponentValidations = Validation.useRemoveComponentValidations();
  const nodeId = node.item.id;

  const validationDataSources = useValidationDataSourcesForNode(node);

  useEffect(() => {
    const validations: ComponentValidations[string] = {
      component: [],
      bindingKeys: node.item.dataModelBindings
        ? Object.fromEntries(Object.keys(node.item.dataModelBindings).map((key) => [key, []]))
        : {},
    };

    /**
     * Run required validation
     */
    if (implementsValidateEmptyField(node.def)) {
      for (const validation of node.def.runEmptyFieldValidation(node as any, validationDataSources as any)) {
        if (validation.bindingKey) {
          validations.bindingKeys[validation.bindingKey].push(validation);
        } else {
          validations.component.push(validation);
        }
      }
    }

    /**
     * Run component validation
     */
    if (implementsValidateComponent(node.def)) {
      for (const validation of node.def.runComponentValidation(node as any, validationDataSources as any)) {
        if (validation.bindingKey) {
          validations.bindingKeys[validation.bindingKey].push(validation);
        } else {
          validations.component.push(validation);
        }
      }
    }

    updateComponentValidations(nodeId, validations);
  }, [node, nodeId, updateComponentValidations, validationDataSources]);

  // Cleanup on unmount
  useEffect(() => () => removeComponentValidations(nodeId), [nodeId, removeComponentValidations]);

  return null;
}

function useValidationDataSourcesForNode<T extends CompTypes>(node: LayoutNode<T>): ValidationDataSources<T> {
  const currentLanguage = useCurrentLanguage();

  const _formData = node.getFormData(node.dataSources.formDataSelector) as IComponentFormData<T>;
  const formData = useMemoDeepEqual(() => _formData, [_formData]);

  const _invalidData = node.getFormData(node.dataSources.invalidDataSelector) as IComponentFormData<T>;
  const invalidData = useMemoDeepEqual(() => _invalidData, [_invalidData]);

  const _attachments = useAttachments()[node.item.id];
  const attachments = useMemoDeepEqual(() => _attachments, [_attachments]);

  return useMemo(
    () => ({
      currentLanguage,
      formData,
      invalidData,
      attachments,
    }),
    [attachments, currentLanguage, formData, invalidData],
  );
}
