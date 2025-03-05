import { FrontendValidationSource, ValidationMask } from 'src/features/validation';
import { GeneratorData } from 'src/utils/layout/generator/GeneratorDataSources';
import { NodesInternal } from 'src/utils/layout/NodesContext';
import type { ComponentValidation } from 'src/features/validation';
import type { LayoutNode } from 'src/utils/layout/LayoutNode';

export function useAddressValidation(node: LayoutNode<'Address'>): ComponentValidation[] {
  const dataModelBindings = NodesInternal.useNodeData(node, (d) => d.layout.dataModelBindings);
  const { formDataSelector } = GeneratorData.useValidationDataSources();
  if (!dataModelBindings) {
    return [];
  }
  const validations: ComponentValidation[] = [];

  const zipCodeField = dataModelBindings.zipCode;
  const zipCode = zipCodeField ? formDataSelector(zipCodeField) : undefined;
  const zipCodeAsString = typeof zipCode === 'string' || typeof zipCode === 'number' ? String(zipCode) : undefined;

  // TODO(Validation): Add better message for the special case of 0000 or add better validation for zipCodes that the API says are invalid
  if (zipCodeAsString && (!zipCodeAsString.match(/^\d{4}$/) || zipCodeAsString === '0000')) {
    validations.push({
      message: { key: 'address_component.validation_error_zipcode' },
      severity: 'error',
      bindingKey: 'zipCode',
      source: FrontendValidationSource.Component,
      category: ValidationMask.Component,
    });
  }

  const houseNumberField = dataModelBindings.houseNumber;
  const houseNumber = houseNumberField ? formDataSelector(houseNumberField) : undefined;
  const houseNumberAsString =
    typeof houseNumber === 'string' || typeof houseNumber === 'number' ? String(houseNumber) : undefined;

  if (houseNumberAsString && !houseNumberAsString.match(/^[a-z,A-Z]\d{4}$/)) {
    validations.push({
      message: { key: 'address_component.validation_error_house_number' },
      severity: 'error',
      bindingKey: 'houseNumber',
      source: FrontendValidationSource.Component,
      category: ValidationMask.Component,
    });
  }

  return validations;
}
