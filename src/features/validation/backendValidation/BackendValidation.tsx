import { useEffect } from 'react';

import { DataModels } from 'src/features/datamodel/DataModelsProvider';
import { useBackendValidationQuery } from 'src/features/validation/backendValidation/backendValidationQuery';
import {
  mapBackendIssuesToTaskValidations,
  mapBackendValidationsToValidatorGroups,
  mapValidatorGroupsToDataModelValidations,
  useShouldValidateInitial,
} from 'src/features/validation/backendValidation/backendValidationUtils';
import { Validation } from 'src/features/validation/validationContext';

export function BackendValidation() {
  const updateBackendValidations = Validation.useUpdateBackendValidations();
  const defaultDataElementId = DataModels.useDefaultDataElementId();
  const enabled = useShouldValidateInitial();
  const { data: initialValidations, isFetching: isFetchingInitial } = useBackendValidationQuery({ enabled });

  // Initial validation
  useEffect(() => {
    if (!isFetchingInitial) {
      const initialTaskValidations = mapBackendIssuesToTaskValidations(initialValidations);
      const initialValidatorGroups = mapBackendValidationsToValidatorGroups(initialValidations, defaultDataElementId);
      const backendValidations = mapValidatorGroupsToDataModelValidations(initialValidatorGroups);
      updateBackendValidations(backendValidations, { initial: initialValidations }, initialTaskValidations);
    }
  }, [defaultDataElementId, initialValidations, isFetchingInitial, updateBackendValidations]);

  return null;
}
