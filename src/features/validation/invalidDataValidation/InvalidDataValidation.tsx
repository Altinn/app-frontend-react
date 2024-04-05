import { useEffect } from 'react';

import dot from 'dot-object';

import { FrontendValidationSource, ValidationMask } from '..';

import { FD } from 'src/features/formData/FormDataWrite';
import { Validation } from 'src/features/validation/validationContext';

function isScalar(value: any): value is string | number | boolean {
  return typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean';
}

export function InvalidDataValidation({ dataType }: { dataType: string }) {
  const updateValidations = Validation.useUpdateValidations();
  const invalidData = FD.useInvalidDebounced(dataType);

  useEffect(() => {
    const validations = { [dataType]: {} };

    if (Object.keys(invalidData).length > 0) {
      validations[dataType] = Object.entries(dot.dot(invalidData))
        .filter(([_, value]) => isScalar(value))
        .reduce((validations, [field, _]) => {
          if (!validations[field]) {
            validations[field] = [];
          }

          validations[field].push({
            field,
            source: FrontendValidationSource.InvalidData,
            message: { key: 'validation_errors.pattern' },
            severity: 'error',
            category: ValidationMask.Schema, // Use same visibility as schema validations
          });

          return validations;
        }, {});
    }
    updateValidations('invalidData', validations);

    // Cleanup function
    return () => updateValidations('invalidData', { [dataType]: {} });
  }, [dataType, invalidData, updateValidations]);

  return null;
}
