import React, { useEffect } from 'react';

import type { ComponentValidations } from '..';

import { Validation } from 'src/features/validation/validationContext';
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
  const updateValidations = Validation.useUpdateValidations();
  const nodeId = node.item.id;

  // TODO(Datamodels): Will this actually run when only formData changes for a node?
  useEffect(() => {
    const validations: ComponentValidations = {
      [nodeId]: {
        component: [],
        bindingKeys: node.item.dataModelBindings
          ? Object.fromEntries(Object.keys(node.item.dataModelBindings).map((key) => [key, []]))
          : {},
      },
    };

    /**
     * Run required validation
     */
    if (implementsValidateEmptyField(node.def)) {
      for (const validation of node.def.runEmptyFieldValidation(node as any)) {
        if (validation.bindingKey) {
          validations[nodeId].bindingKeys[validation.bindingKey].push(validation);
        } else {
          validations[nodeId].component.push(validation);
        }
      }
    }

    /**
     * Run component validation
     */
    if (implementsValidateComponent(node.def)) {
      for (const validation of node.def.runComponentValidation(node as any)) {
        if (validation.bindingKey) {
          validations[nodeId].bindingKeys[validation.bindingKey].push(validation);
        } else {
          validations[nodeId].component.push(validation);
        }
      }
    }

    updateValidations('component', validations);
  }, [node, nodeId, updateValidations]);

  // Cleanup on unmount
  useEffect(
    () => () => updateValidations('component', { [nodeId]: { component: [], bindingKeys: {} } }),
    [nodeId, updateValidations],
  );

  return null;
}
