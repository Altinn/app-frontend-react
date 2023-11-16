import { mergeFormValidations } from 'src/features/validation';
import { implementsAnyValidation } from 'src/layout';
import { groupIsRepeatingExt } from 'src/layout/Group/tools';
import { getSchemaValidationErrors } from 'src/utils/validation/schemaValidation';
import type { IAttachments, UploadedAttachment } from 'src/features/attachments';
import type { IFormData } from 'src/features/formData';
import type { FormValidations } from 'src/features/validation/types';
import type { IUseLanguage } from 'src/hooks/useLanguage';
import type { CompGroupExternal } from 'src/layout/Group/config.generated';
import type { CompInternal, CompOrGroupExternal, ILayout } from 'src/layout/layout';
import type { LayoutNode } from 'src/utils/layout/LayoutNode';
import type { ILayoutValidations, IValidations, ValidationContextGenerator } from 'src/utils/validation/types';

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

/**
 * @deprecated
 * @see useExprContext
 * @see useResolvedNode
 * @see ResolvedNodesSelector
 */
export function getGroupChildren(groupId: string, layout: ILayout): CompOrGroupExternal[] {
  const layoutGroup = layout.find((element) => element.id === groupId) as CompGroupExternal;
  return layout.filter(
    (element) =>
      layoutGroup?.children
        ?.map((id) => (groupIsRepeatingExt(layoutGroup) && layoutGroup.edit?.multiPage ? id.split(':')[1] : id))
        .includes(element.id),
  );
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

/**
 * Returns true if there are errors in the form at all (faster than getting all mapped/unmapped errors)
 * When this returns true, ErrorReport.tsx should be displayed
 */
export const getFormHasErrors = (validations: IValidations): boolean => {
  for (const layout in validations) {
    for (const key in validations[layout]) {
      const validationObject = validations[layout][key];
      for (const fieldKey in validationObject) {
        const fieldValidationErrors = validationObject[fieldKey]?.errors;
        if (fieldValidationErrors && fieldValidationErrors.length > 0) {
          return true;
        }
      }
    }
  }
  return false;
};

export function missingFieldsInLayoutValidations(
  layoutValidations: ILayoutValidations,
  requiredValidationTextResources: string[],
  langTools: IUseLanguage,
): boolean {
  let result = false;
  let requiredMessage = langTools.langAsString('form_filler.error_required');
  // Strip away parametrized part of error message, as this will vary with each component.
  requiredMessage = requiredMessage.substring(0, requiredMessage.indexOf('{0}'));
  const lookForRequiredMsg = (e: any) => {
    if (typeof e === 'string') {
      return e.includes(requiredMessage);
    }
    if (Array.isArray(e)) {
      return e.findIndex(lookForRequiredMsg) > -1;
    }
    return (e?.props?.children as string).includes(requiredMessage);
  };

  Object.keys(layoutValidations).forEach((component: string) => {
    if (!layoutValidations[component] || result) {
      return;
    }
    Object.keys(layoutValidations[component]).forEach((binding: string) => {
      if (!layoutValidations[component][binding] || result) {
        return;
      }

      const errors = layoutValidations[component][binding]?.errors;

      const customRequiredValidationMessageExists = errors?.some((error) =>
        requiredValidationTextResources.includes(error),
      );

      result = !!(
        (errors && errors.length > 0 && errors.findIndex(lookForRequiredMsg) > -1) ||
        customRequiredValidationMessageExists
      );
    });
  });

  return result;
}
