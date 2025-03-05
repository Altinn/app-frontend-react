import { type ComponentValidation, FrontendValidationSource, ValidationMask } from 'src/features/validation';
import { getFieldNameKey } from 'src/utils/formComponentUtils';
import { GeneratorData } from 'src/utils/layout/generator/GeneratorDataSources';
import type { IDataModelReference } from 'src/layout/common.generated';
import type { CompTypes, CompWithBinding } from 'src/layout/layout';
import type { LayoutNode } from 'src/utils/layout/LayoutNode';

/**
 * Default implementation of useEmptyFieldValidation
 * Checks all the component's dataModelBindings and returns one error for each one missing data
 */
export function useEmptyFieldValidationAllBindings<Type extends CompTypes>(
  node: LayoutNode<Type>,
): ComponentValidation[] {
  const { nodeDataSelector, formDataSelector, invalidDataSelector } = GeneratorData.useValidationDataSources();
  const required = nodeDataSelector(
    (picker) => {
      const item = picker(node.id, node.type)?.item;
      return item && 'required' in item ? item.required : false;
    },
    [node],
  );
  const dataModelBindings = nodeDataSelector((picker) => picker(node.id, node.type)?.layout.dataModelBindings, [node]);
  if (!required || !dataModelBindings) {
    return [];
  }

  const validations: ComponentValidation[] = [];

  for (const [bindingKey, reference] of Object.entries(dataModelBindings as Record<string, IDataModelReference>)) {
    const data = formDataSelector(reference) ?? invalidDataSelector(reference);
    const asString =
      typeof data === 'string' || typeof data === 'number' || typeof data === 'boolean' ? String(data) : '';
    const trb = nodeDataSelector((picker) => picker(node.id, node.type)?.item?.textResourceBindings, [node]);

    if (asString.length === 0) {
      const key =
        trb && 'requiredValidation' in trb && trb.requiredValidation
          ? trb.requiredValidation
          : 'form_filler.error_required';
      const fieldReference = { key: getFieldNameKey(trb, bindingKey), makeLowerCase: true };

      validations.push({
        source: FrontendValidationSource.EmptyField,
        bindingKey,
        message: { key, params: [fieldReference] },
        severity: 'error',
        category: ValidationMask.Required,
      });
    }
  }
  return validations;
}

/**
 * Special implementation of useEmptyFieldValidation
 * Only checks simpleBinding, this is useful for components that may save additional data which is not directly controlled by the user,
 * like options-based components that can store the label and metadata about the options alongside the actual value
 */
export function useEmptyFieldValidationOnlySimpleBinding<Type extends CompWithBinding<'simpleBinding'>>(
  node: LayoutNode<Type>,
): ComponentValidation[] {
  const { formDataSelector, invalidDataSelector, nodeDataSelector } = GeneratorData.useValidationDataSources();
  const required = nodeDataSelector(
    (picker) => {
      const item = picker(node.id, node.type)?.item;
      return item && 'required' in item ? item.required : false;
    },
    [node],
  );
  const reference = nodeDataSelector(
    (picker) => picker(node.id, node.type)?.layout.dataModelBindings.simpleBinding,
    [node],
  );
  if (!required || !reference) {
    return [];
  }

  const validations: ComponentValidation[] = [];

  const data = formDataSelector(reference) ?? invalidDataSelector(reference);
  const asString =
    typeof data === 'string' || typeof data === 'number' || typeof data === 'boolean' ? String(data) : '';
  const trb = nodeDataSelector((picker) => picker(node.id, node.type)?.item?.textResourceBindings, [node]);

  if (asString.length === 0) {
    const key =
      trb && 'requiredValidation' in trb && trb.requiredValidation
        ? trb.requiredValidation
        : 'form_filler.error_required';
    const fieldReference = { key: getFieldNameKey(trb, 'simpleBinding'), makeLowerCase: true };

    validations.push({
      source: FrontendValidationSource.EmptyField,
      bindingKey: 'simpleBinding',
      message: { key, params: [fieldReference] },
      severity: 'error',
      category: ValidationMask.Required,
    });
  }
  return validations;
}
