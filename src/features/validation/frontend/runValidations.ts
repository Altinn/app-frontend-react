import { getSchemaValidationErrors } from 'src/features/validation/frontend/schemaValidation';
import { mergeFormValidations } from 'src/features/validation/utils';
import { implementsAnyValidation } from 'src/layout';
import type { FormValidations, ValidationContextGenerator } from 'src/features/validation';
import type { LayoutNode } from 'src/utils/layout/LayoutNode';

export function runValidationOnNodes(nodes: LayoutNode[], ctxGenerator: ValidationContextGenerator): FormValidations {
  const basicContext = ctxGenerator(undefined);
  const nodesToValidate = nodes.filter(
    (node) => implementsAnyValidation(node.def) && !('renderAsSummary' in node.item && node.item.renderAsSummary),
  );

  const validations: FormValidations = {
    fields: {},
    components: {},
  };

  if (nodesToValidate.length === 0) {
    return validations;
  }

  const schemaErrors = getSchemaValidationErrors(basicContext);

  for (const node of nodesToValidate) {
    const nodeContext = ctxGenerator(node);

    if (implementsAnyValidation(node.def)) {
      mergeFormValidations(validations, node.def.runValidations(node as any, nodeContext, schemaErrors));
    }
  }

  return validations;
}
