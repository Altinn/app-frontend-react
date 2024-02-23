import { implementsAnyValidation } from 'src/layout';
import type { ComponentValidations, ValidationDataSources } from 'src/features/validation';
import type { LayoutNode } from 'src/utils/layout/LayoutNode';

export function runValidationOnNodes(nodes: LayoutNode[], context: ValidationDataSources): ComponentValidations[] {
  const nodesToValidate = nodes.filter(
    (node) => implementsAnyValidation(node.def) && !('renderAsSummary' in node.item && node.item.renderAsSummary),
  );

  const validations: ComponentValidations[] = [];

  if (nodesToValidate.length === 0) {
    return validations;
  }

  for (const node of nodesToValidate) {
    if (implementsAnyValidation(node.def)) {
      validations.push(node.def.runValidations(node as any, context));
    }
  }

  return validations;
}
