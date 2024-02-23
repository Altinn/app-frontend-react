import { implementsValidateComponent, implementsValidateEmptyField } from '.';

import type { ComponentValidation, ComponentValidations, ValidationDataSources } from 'src/features/validation';
import type { CompTypes } from 'src/layout/layout';
import type { LayoutNode } from 'src/utils/layout/LayoutNode';

export function runAllValidations<Type extends CompTypes>(
  node: LayoutNode<Type>,
  ctx: ValidationDataSources,
): ComponentValidations {
  const componentValidations: ComponentValidations = {
    [node.item.id]: {
      bindingKeys: {},
      component: [],
    },
  };

  if (node.item.dataModelBindings) {
    for (const [bindingKey] of Object.entries(node.item.dataModelBindings)) {
      componentValidations[node.item.id].bindingKeys[bindingKey] = [];
    }
  }

  const validations: ComponentValidation[] = [];
  if (implementsValidateEmptyField(node.def)) {
    validations.push(...node.def.runEmptyFieldValidation(node as any, ctx));
  }
  if (implementsValidateComponent(node.def)) {
    validations.push(...node.def.runComponentValidation(node as any, ctx));
  }

  for (const validation of validations) {
    if (validation.bindingKey) {
      componentValidations[node.item.id].bindingKeys[validation.bindingKey].push(validation);
    } else {
      componentValidations[node.item.id].component.push(validation);
    }
  }

  return componentValidations;
}
