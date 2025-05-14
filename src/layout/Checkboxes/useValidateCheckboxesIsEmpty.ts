import { FD } from 'src/features/formData/FormDataWrite';
import { FrontendValidationSource, ValidationMask } from 'src/features/validation';
import { getFieldNameKey } from 'src/utils/formComponentUtils';
import { NodesInternal } from 'src/utils/layout/NodesContext';
import { useNodeFormDataWhenType } from 'src/utils/layout/useNodeItem';
import type { ComponentValidation } from 'src/features/validation';
import type { LayoutNode } from 'src/utils/layout/LayoutNode';

export function useValidateCheckboxIsEmpty(node: LayoutNode<'Checkboxes'>): ComponentValidation[] {
  const required = NodesInternal.useNodeData(node, (d) => (d.item && 'required' in d.item ? d.item.required : false));
  const dataModelBindings = NodesInternal.useNodeData(node, (d) => d.layout.dataModelBindings);
  const textResourceBindings = NodesInternal.useNodeData(node, (d) => d.item?.textResourceBindings);
  const formData = useNodeFormDataWhenType(node.id, 'Checkboxes');
  const invalidDataSelector = FD.useInvalidDebouncedSelector();
  if (!required || !dataModelBindings) {
    return [];
  }

  const validations: ComponentValidation[] = [];

  let checkboxesHasErrors = false;
  if (dataModelBindings.group) {
    const numRows = (formData?.group as unknown[] | undefined) ?? [];
    checkboxesHasErrors = numRows.length === 0;
  } else {
    for (const key of Object.keys(dataModelBindings)) {
      const reference = dataModelBindings[key];
      if (reference) {
        const data = formData?.[key] ?? invalidDataSelector(reference);
        const dataAsString =
          typeof data === 'string' || typeof data === 'number' || typeof data === 'boolean' ? String(data) : undefined;

        if (!dataAsString?.length) {
          checkboxesHasErrors = true;
        }
      }
    }
  }

  if (checkboxesHasErrors) {
    const key = textResourceBindings?.requiredValidation
      ? textResourceBindings?.requiredValidation
      : 'form_filler.error_required';

    const fieldNameReference = {
      key: getFieldNameKey(textResourceBindings, undefined),
      makeLowerCase: true,
    };

    validations.push({
      message: {
        key,
        params: [fieldNameReference],
      },
      severity: 'error',
      source: FrontendValidationSource.EmptyField,
      category: ValidationMask.Required,
    });
  }
  return validations;
}
