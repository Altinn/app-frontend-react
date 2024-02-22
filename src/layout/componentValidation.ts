import { implementsValidateComponent, implementsValidateEmptyField } from '.';

import { runExpressionValidationsOnNode } from 'src/features/validation/frontend/expressionValidation';
import { isComponentValidation, isFieldValidation } from 'src/features/validation/utils';
import type {
  ComponentValidation,
  FieldValidation,
  FrontendValidations,
  ValidationDataSources,
} from 'src/features/validation';
import type { CompTypes } from 'src/layout/layout';
import type { LayoutNode } from 'src/utils/layout/LayoutNode';

export function runAllValidations<Type extends CompTypes>(
  node: LayoutNode<Type>,
  ctx: ValidationDataSources,
): FrontendValidations {
  const formValidations: FrontendValidations = {
    fields: {},
    components: {
      [node.item.id]: {
        bindingKeys: {},
        component: [],
      },
    },
  };

  if (node.item.dataModelBindings) {
    for (const [bindingKey, field] of Object.entries(node.item.dataModelBindings)) {
      formValidations.fields[field] = [];
      formValidations.components[node.item.id].bindingKeys[bindingKey] = [];
    }
  }

  const validations: (FieldValidation | ComponentValidation)[] = [];
  if (implementsValidateEmptyField(node.def)) {
    validations.push(...node.def.runEmptyFieldValidation(node as any, ctx));
  }
  if (implementsValidateComponent(node.def)) {
    validations.push(...node.def.runComponentValidation(node as any, ctx));
  }
  validations.push(...runExpressionValidationsOnNode(node, ctx));

  for (const validation of validations) {
    if (isFieldValidation(validation)) {
      formValidations.fields[validation.field].push(validation);
    } else if (isComponentValidation(validation)) {
      if (validation.bindingKey) {
        formValidations.components[node.item.id].bindingKeys[validation.bindingKey].push(validation);
      } else {
        formValidations.components[node.item.id].component.push(validation);
      }
    }
  }

  return formValidations;
}
