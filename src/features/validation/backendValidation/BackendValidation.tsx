import { useEffect, useRef } from 'react';

import type { FieldValidations } from '..';

import { DataModels } from 'src/features/datamodel/DataModelsProvider';
import { FD } from 'src/features/formData/FormDataWrite';
import { mapValidationIssueToFieldValidation } from 'src/features/validation/backendValidation/backendValidationUtils';
import { Validation } from 'src/features/validation/validationContext';

export function BackendValidation({ dataType }: { dataType: string }) {
  const updateDataModelValidations = Validation.useUpdateDataModelValidations();

  const lastSaveValidations = FD.useLastSaveValidationIssues(dataType);
  const validatorGroups = useRef(DataModels.useInitialValidations(dataType));

  useEffect(() => {
    const hasValidationsChanged = lastSaveValidations !== undefined && Object.keys(lastSaveValidations).length > 0;

    if (hasValidationsChanged) {
      // Update changed validator groups
      for (const [group, validationIssues] of Object.entries(lastSaveValidations)) {
        validatorGroups.current[group] = validationIssues.map(mapValidationIssueToFieldValidation);
      }

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
              `When validating datamodel ${dataType}, validator ${group} returned a validation error without a field\n`,
              validation,
            );
          }
        }
      }

      updateDataModelValidations('backend', dataType, validations, lastSaveValidations);
    } else {
      // If nothing has changed, return undefined which causes nothing to change except to set the updated lastSaveValidations
      updateDataModelValidations('backend', dataType, undefined, lastSaveValidations);
    }
  }, [dataType, lastSaveValidations, updateDataModelValidations]);

  // Cleanup on unmount
  useEffect(
    () => () => updateDataModelValidations('backend', dataType, {}, undefined),
    [dataType, updateDataModelValidations],
  );

  return null;
}
