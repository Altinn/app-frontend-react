import { FD } from 'src/features/formData/FormDataWrite';
import { FrontendValidationSource, ValidationMask } from 'src/features/validation';
import { getFieldNameKey } from 'src/utils/formComponentUtils';
import { NodesInternal } from 'src/utils/layout/NodesContext';
import type { ComponentValidation } from 'src/features/validation';
import type { LayoutNode } from 'src/utils/layout/LayoutNode';

export function useValidateListIsEmpty(node: LayoutNode<'List'>): ComponentValidation[] {
  const required = NodesInternal.useNodeData(node, (d) => (d.item && 'required' in d.item ? d.item.required : false));
  const dataModelBindings = NodesInternal.useNodeData(node, (d) => d.layout.dataModelBindings);
  const textResourceBindings = NodesInternal.useNodeData(node, (d) => d.item?.textResourceBindings);
  const formDataSelector = FD.useDebouncedSelector();
  const invalidDataSelector = FD.useInvalidDebouncedSelector();
  if (!required || !dataModelBindings) {
    return [];
  }

  const validations: ComponentValidation[] = [];

  let listHasErrors = false;
  for (const key of Object.keys(dataModelBindings)) {
    const reference = dataModelBindings[key];
    if (!reference) {
      continue;
    }
    if (key === 'group') {
      // TODO: Fix, it should validate properly when using a group binding as well
    }

    const data = formDataSelector(reference) ?? invalidDataSelector(reference);
    const dataAsString =
      typeof data === 'string' || typeof data === 'number' || typeof data === 'boolean' ? String(data) : undefined;

    if (!dataAsString?.length) {
      listHasErrors = true;
    }
  }
  if (listHasErrors) {
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
