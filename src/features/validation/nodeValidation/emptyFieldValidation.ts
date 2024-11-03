import {
  type ComponentValidation,
  type EmptyFieldValidationDataSources,
  FrontendValidationSource,
  ValidationMask,
} from 'src/features/validation';
import { getFieldNameKey } from 'src/utils/formComponentUtils';
import type { FormDataSelector } from 'src/layout';
import type { IDataModelReference } from 'src/layout/common.generated';
import type { CompTypes, CompWithBinding } from 'src/layout/layout';
import type { LayoutNode } from 'src/utils/layout/LayoutNode';
import type { NodeDataSelector } from 'src/utils/layout/NodesContext';

/**
 * Default implementation of runEmptyFieldValidation
 * Checks all of the component's dataModelBindings and returns one error for each one missing data
 */
export function runEmptyFieldValidationAllBindings<Type extends CompTypes>(
  node: LayoutNode<Type>,
  { formDataSelector, invalidDataSelector, nodeDataSelector }: EmptyFieldValidationDataSources,
): ComponentValidation[] {
  const required = nodeDataSelector(
    (picker) => {
      const item = picker(node)?.item;
      return item && 'required' in item ? item.required : false;
    },
    [node],
  );
  const dataModelBindings = nodeDataSelector((picker) => picker(node)?.layout.dataModelBindings, [node]);
  if (!required || !dataModelBindings) {
    return [];
  }

  const validations: ComponentValidation[] = [];

  for (const [bindingKey, reference] of Object.entries(dataModelBindings as Record<string, IDataModelReference>)) {
    validations.push(
      ...validateRequiredField(node, bindingKey, reference, formDataSelector, invalidDataSelector, nodeDataSelector),
    );
  }
  return validations;
}

/**
 * Special implementation of runEmptyFieldValidation
 * Only checks simpleBinding, this is useful for components that may save additional data which is not directly controlled by the user,
 * like options-based components that can store the label and metadata about the options along side the actual value
 */
export function runEmptyFieldValidationOnlySimpleBinding<Type extends CompWithBinding<'simpleBinding'>>(
  node: LayoutNode<Type>,
  { formDataSelector, invalidDataSelector, nodeDataSelector }: EmptyFieldValidationDataSources,
): ComponentValidation[] {
  const required = nodeDataSelector(
    (picker) => {
      const item = picker(node)?.item;
      return item && 'required' in item ? item.required : false;
    },
    [node],
  );
  const reference = nodeDataSelector((picker) => picker(node)?.layout.dataModelBindings.simpleBinding, [node]);
  if (!required || !reference) {
    return [];
  }

  return validateRequiredField(
    node,
    'simpleBinding',
    reference,
    formDataSelector,
    invalidDataSelector,
    nodeDataSelector,
  );
}

function validateRequiredField(
  node: LayoutNode,
  bindingKey: string,
  reference: IDataModelReference,
  formDataSelector: FormDataSelector,
  invalidDataSelector: FormDataSelector,
  nodeDataSelector: NodeDataSelector,
): ComponentValidation[] {
  const data = formDataSelector(reference) ?? invalidDataSelector(reference);
  const asString =
    typeof data === 'string' || typeof data === 'number' || typeof data === 'boolean' ? String(data) : '';
  const trb = nodeDataSelector((picker) => picker(node)?.item?.textResourceBindings, [node]);

  if (asString.length === 0) {
    const key =
      trb && 'requiredValidation' in trb && trb.requiredValidation
        ? trb.requiredValidation
        : 'form_filler.error_required';
    const fieldReference = { key: getFieldNameKey(trb, bindingKey), makeLowerCase: true };

    return [
      {
        source: FrontendValidationSource.EmptyField,
        bindingKey,
        message: { key, params: [fieldReference] },
        severity: 'error',
        category: ValidationMask.Required,
      },
    ];
  }
  return [];
}
