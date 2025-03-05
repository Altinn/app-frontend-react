import { FrontendValidationSource, ValidationMask } from 'src/features/validation';
import { getFieldNameKey } from 'src/utils/formComponentUtils';
import { GeneratorData } from 'src/utils/layout/generator/GeneratorDataSources';
import type { ComponentValidation } from 'src/features/validation';
import type { LayoutNode } from 'src/utils/layout/LayoutNode';

export function useValidateListIsEmpty(node: LayoutNode<'List'>): ComponentValidation[] {
  const { nodeDataSelector, formDataSelector, invalidDataSelector } = GeneratorData.useValidationDataSources();
  const required = nodeDataSelector(
    (picker) => {
      const item = picker(node.id, 'List')?.item;
      return item && 'required' in item ? item.required : false;
    },
    [node.id],
  );
  const dataModelBindings = nodeDataSelector((picker) => picker(node.id, 'List')?.layout.dataModelBindings, [node.id]);
  if (!required || !dataModelBindings) {
    return [];
  }

  const references = Object.values(dataModelBindings);
  const validations: ComponentValidation[] = [];
  const textResourceBindings = nodeDataSelector(
    (picker) => picker(node.id, 'List')?.item?.textResourceBindings,
    [node.id],
  );

  let listHasErrors = false;
  for (const reference of references) {
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
