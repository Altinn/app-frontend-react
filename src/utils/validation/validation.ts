import { mergeFormValidations } from 'src/features/validation';
import { implementsAnyValidation } from 'src/layout';
import { groupIsRepeatingExt } from 'src/layout/Group/tools';
import { getSchemaValidationErrors } from 'src/utils/validation/schemaValidation';
import type { IAttachments, UploadedAttachment } from 'src/features/attachments';
import type { IFormData } from 'src/features/formData';
import type { FormValidations } from 'src/features/validation/types';
import type { CompGroupExternal } from 'src/layout/Group/config.generated';
import type { CompInternal, ILayout } from 'src/layout/layout';
import type { LayoutNode } from 'src/utils/layout/LayoutNode';
import type { ValidationContextGenerator } from 'src/utils/validation/types';

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

/**
 * @deprecated
 * @see useExprContext
 * @see useResolvedNode
 * @see ResolvedNodesSelector
 */
export function getParentGroup(groupId: string, layout: ILayout): CompGroupExternal | undefined {
  if (!groupId || !layout) {
    return undefined;
  }
  return layout.find((element) => {
    if (element.id !== groupId && element.type === 'Group') {
      const childrenWithoutMultiPage = element.children?.map((childId) =>
        groupIsRepeatingExt(element) && element.edit?.multiPage ? childId.split(':')[1] : childId,
      );
      if (childrenWithoutMultiPage?.indexOf(groupId) > -1) {
        return true;
      }
    }
    return false;
  }) as CompGroupExternal | undefined;
}

export function attachmentsValid(
  attachments: IAttachments,
  component: CompInternal<'FileUpload' | 'FileUploadWithTag'>,
): boolean {
  if (component.minNumberOfAttachments === 0) {
    return true;
  }

  const attachmentsForComponent = attachments[component.id];
  if (!attachmentsForComponent) {
    return false;
  }

  return attachmentsForComponent.length >= component.minNumberOfAttachments;
}

export function attachmentIsMissingTag(attachment: UploadedAttachment): boolean {
  return attachment.data.tags === undefined || attachment.data.tags.length === 0;
}
