import { getSchemaValidationErrors } from 'src/features/validation/frontend/schemaValidation';
import { mergeFormValidations } from 'src/features/validation/utils';
import { implementsAnyValidation } from 'src/layout';
import type { IFormData } from 'src/features/formData';
import type { FormValidations, ValidationContextGenerator } from 'src/features/validation';
import type { LayoutNode } from 'src/utils/layout/LayoutNode';

/**
 * Runs all frontend validations on a list of nodes, and optionally skips some types of validations.
 * overrideFormData can be used to validate new data before saving.
 */
export function runValidationOnNodes(
  nodes: LayoutNode[],
  ctxGenerator: ValidationContextGenerator,
  overrideFormData?: IFormData,
): FormValidations {
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

  const schemaErrors = getSchemaValidationErrors(basicContext, overrideFormData);

  for (const node of nodesToValidate) {
    const nodeContext = ctxGenerator(node);

    if (implementsAnyValidation(node.def)) {
      mergeFormValidations(
        validations,
        node.def.runValidations(node as any, nodeContext, schemaErrors, overrideFormData),
      );
    }
  }

  return validations;
}
