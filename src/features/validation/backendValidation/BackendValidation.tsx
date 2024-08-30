import { useEffect, useMemo, useRef } from 'react';

import deepEqual from 'fast-deep-equal';

import type { BackendFieldValidatorGroups, BackendValidationIssueGroups } from '..';

import { DataModels } from 'src/features/datamodel/DataModelsProvider';
import { FD } from 'src/features/formData/FormDataWrite';
import {
  mapBackendIssuesToFieldValdiations,
  mapValidatorGroupsToDataModelValidations,
} from 'src/features/validation/backendValidation/backendValidationUtils';
import { Validation } from 'src/features/validation/validationContext';

export function BackendValidation({ dataTypes }: { dataTypes: string[] }) {
  const updateBackendValidations = Validation.useUpdateBackendValidations();
  const getDataTypeForElementId = DataModels.useGetDataTypeForDataElementId();
  const lastSaveValidations = FD.useLastSaveValidationIssues();

  // Map initial validations
  const initialValidations = DataModels.useInitialValidations();
  const initialValidatorGroups: BackendFieldValidatorGroups = useMemo(() => {
    if (!initialValidations) {
      return {};
    }
    const fieldValidations = mapBackendIssuesToFieldValdiations(initialValidations, getDataTypeForElementId);
    const validatorGroups: BackendFieldValidatorGroups = {};
    for (const validation of fieldValidations) {
      if (!validatorGroups[validation.source]) {
        validatorGroups[validation.source] = [];
      }
      validatorGroups[validation.source].push(validation);
    }
    return validatorGroups;
  }, [getDataTypeForElementId, initialValidations]);

  useEffect(() => {
    const backendValidations = mapValidatorGroupsToDataModelValidations(initialValidatorGroups, dataTypes);
    // TODO(Datamodels): Consider loosening the type for issueGroupsProcessedLast
    // Since we only use issueGroupsProcessed last for comparing object references, so this assertion should not cause runtime errors.
    updateBackendValidations(backendValidations, initialValidatorGroups as unknown as BackendValidationIssueGroups);
  }, [dataTypes, initialValidatorGroups, updateBackendValidations]);

  const validatorGroups = useRef<BackendFieldValidatorGroups>(initialValidatorGroups);

  // Update validators and propagate changes to validationcontext
  useEffect(() => {
    if (lastSaveValidations) {
      const newValidatorGroups = structuredClone(validatorGroups.current);

      for (const [group, validationIssues] of Object.entries(lastSaveValidations)) {
        newValidatorGroups[group] = mapBackendIssuesToFieldValdiations(validationIssues, getDataTypeForElementId);
      }

      if (deepEqual(validatorGroups.current, newValidatorGroups)) {
        // Dont update any validations, only set last saved validations
        updateBackendValidations(undefined, lastSaveValidations);
        return;
      }

      validatorGroups.current = newValidatorGroups;
      const backendValidations = mapValidatorGroupsToDataModelValidations(validatorGroups.current, dataTypes);
      updateBackendValidations(backendValidations, lastSaveValidations);
    }
  }, [dataTypes, getDataTypeForElementId, lastSaveValidations, updateBackendValidations]);

  return null;
}
