import { useMemo } from 'react';

import dot from 'dot-object';

import { FD } from 'src/features/formData/FormDataWrite';
import { FrontendValidationSource, ValidationMask } from 'src/features/validation';
import type { FieldValidations } from 'src/features/validation';

const __default__ = {};

export function useInvalidDataValidation(): FieldValidations {
  const invalidData = FD.useInvalidDebounced();

  return useMemo(() => {
    if (Object.keys(invalidData).length === 0) {
      return __default__;
    }

    return Object.keys(dot.dot(invalidData)).reduce((validations, field) => {
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
  }, [invalidData]);
}
