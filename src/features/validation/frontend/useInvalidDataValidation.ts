import { useMemo } from 'react';

import dot from 'dot-object';

import { FD } from 'src/features/formData/FormDataWrite';
import { FrontendValidationSource, ValidationMask } from 'src/features/validation';
import type { FieldValidations } from 'src/features/validation';

export function useInvalidDataValidation(): FieldValidations {
  const invalidData = FD.useInvalidDebounced();

  return useMemo(
    () =>
      Object.keys(dot.dot(invalidData)).reduce((validations, field) => {
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
      }, {}),
    [invalidData],
  );
}
