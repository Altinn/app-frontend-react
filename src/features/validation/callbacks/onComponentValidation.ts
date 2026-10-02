import { useCallback } from 'react';

import { ValidationMask } from 'src/features/validation';
import { Validation } from 'src/features/validation/validationContext';
import { useIndexedId } from 'src/utils/layout/DataModelLocation';
import { NodesInternal } from 'src/utils/layout/NodesContext';

/** Validates the lookup result once it has been saved and reveals errors only on this component. */
export function useOnComponentValidation(baseComponentId: string) {
  const indexedId = useIndexedId(baseComponentId);
  const validating = Validation.useValidating();
  const getValidations = NodesInternal.useValidationsSelector();
  const setVisibility = NodesInternal.useSetNodeVisibility();

  return useCallback(async () => {
    await validating();
    const errors = getValidations(indexedId, ValidationMask.All, 'error');
    if (errors.length) {
      setVisibility([indexedId], ValidationMask.All);
    }
    return errors;
  }, [getValidations, indexedId, setVisibility, validating]);
}
