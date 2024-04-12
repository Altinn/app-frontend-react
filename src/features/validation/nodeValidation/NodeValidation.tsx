import React, { useEffect } from 'react';

import type { ComponentValidations } from '..';

import { Validation } from 'src/features/validation/validationContext';
import { useMemoDeepEqual } from 'src/hooks/useStateDeepEqual';
import { implementsAnyValidation, implementsValidateComponent, implementsValidateEmptyField } from 'src/layout';
import { useNodes } from 'src/utils/layout/NodesContext';
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

function SpecificNodeValidation({ node }: { node: LayoutNode }) {
  const updateComponentValidations = Validation.useUpdateComponentValidations();
  const removeComponentValidations = Validation.useRemoveComponentValidations();
  const nodeId = node.item.id;

  const _formData = node.getFormData(node.dataSources.formDataSelector);
  const _invalidData = node.getFormData(node.dataSources.invalidDataSelector);
  const formData = useMemoDeepEqual(() => _formData, [_formData]);
  const invalidData = useMemoDeepEqual(() => _invalidData, [_invalidData]);

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
      for (const validation of node.def.runEmptyFieldValidation(node as any)) {
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
      for (const validation of node.def.runComponentValidation(node as any)) {
        if (validation.bindingKey) {
          validations.bindingKeys[validation.bindingKey].push(validation);
        } else {
          validations.component.push(validation);
        }
      }
    }

    updateComponentValidations(nodeId, validations);
  }, [node, nodeId, updateComponentValidations, formData, invalidData]);

  // Cleanup on unmount
  useEffect(() => () => removeComponentValidations(nodeId), [nodeId, removeComponentValidations]);

  return null;
}
