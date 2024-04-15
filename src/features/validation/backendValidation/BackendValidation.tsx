import { useCallback, useEffect, useRef } from 'react';

import type { FieldValidations } from '..';

import { DataModels } from 'src/features/datamodel/DataModelsProvider';
import { FD } from 'src/features/formData/FormDataWrite';
import { mapValidationIssueToFieldValidation } from 'src/features/validation/backendValidation/backendValidationUtils';
import { Validation } from 'src/features/validation/validationContext';
import { useAsRef } from 'src/hooks/useAsRef';

export function BackendValidation({ dataType }: { dataType: string }) {
  const dataTypeRef = useAsRef(dataType);
  const updateDataModelValidations = Validation.useUpdateDataModelValidations();

  const lastSaveValidations = FD.useLastSaveValidationIssues(dataType);
  const validatorGroups = useRef(DataModels.useInitialValidations(dataType));

  const getDataModelValidationsFromValidatorGroups = useCallback(() => {
    const validations: FieldValidations = {};

    // Map validator groups to validations per field
    for (const group of Object.values(validatorGroups.current)) {
      for (const validation of group) {
        // TODO(Validation): Consider removing this check if it is no longer possible to get task errors mixed in with form data errors
        if ('field' in validation) {
          if (!validations[validation.field]) {
            validations[validation.field] = [];
          }
          validations[validation.field].push(validation);
        } else {
          // Unmapped error (task validation)
          window.logWarn(
            `When validating datamodel ${dataTypeRef.current}, validator ${group} returned a validation error without a field\n`,
            validation,
          );
        }
      }
    }
    return validations;
  }, [dataTypeRef]);

  useEffect(() => {
    if (!lastSaveValidations) {
      // Set initial validations

      const validations = getDataModelValidationsFromValidatorGroups();
      updateDataModelValidations('backend', dataType, validations, lastSaveValidations);
    } else if (lastSaveValidations !== undefined && Object.keys(lastSaveValidations).length > 0) {
      // Validations have changed, update changed validator groups

      for (const [group, validationIssues] of Object.entries(lastSaveValidations)) {
        validatorGroups.current[group] = validationIssues.map(mapValidationIssueToFieldValidation);
      }

      const validations = getDataModelValidationsFromValidatorGroups();
      updateDataModelValidations('backend', dataType, validations, lastSaveValidations);
    } else {
      // Nothing has changed, return undefined which causes nothing to change except to set the updated lastSaveValidations

      updateDataModelValidations('backend', dataType, undefined, lastSaveValidations);
    }
  }, [dataType, lastSaveValidations, updateDataModelValidations, getDataModelValidationsFromValidatorGroups]);

  // Cleanup on unmount
  useEffect(
    () => () => updateDataModelValidations('backend', dataType, {}, undefined),
    [dataType, updateDataModelValidations],
  );

  return null;
}
