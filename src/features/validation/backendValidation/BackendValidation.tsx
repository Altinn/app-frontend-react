import React, { useCallback, useEffect, useMemo, useRef } from 'react';

import deepEqual from 'fast-deep-equal';

import type { BackendFieldValidatorGroups, BackendValidationIssueGroups } from '..';

import { DataModels } from 'src/features/datamodel/DataModelsProvider';
import { FD } from 'src/features/formData/FormDataWrite';
import {
  mapBackendIssuesToFieldValdiations,
  mapValidatorGroupsToDataModelValidations,
} from 'src/features/validation/backendValidation/backendValidationUtils';
import { Validation } from 'src/features/validation/validationContext';

function IndividualBackendValidation({
  dataType,
  setGroups,
}: {
  dataType: string;
  setGroups: (groups: BackendValidationIssueGroups, savedDataType: string) => void;
}) {
  const lastSaveValidations = FD.useLastSaveValidationIssues(dataType);

  useEffect(() => {
    if (lastSaveValidations) {
      setGroups(lastSaveValidations, dataType);
    }
  }, [dataType, lastSaveValidations, setGroups]);

  return null;
}

export function BackendValidation({ dataTypes }: { dataTypes: string[] }) {
  const updateBackendValidations = Validation.useUpdateBackendValidations();
  const getDataTypeForElementId = DataModels.useGetDataTypeForDataElementId();

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
    updateBackendValidations(backendValidations);
  }, [dataTypes, initialValidatorGroups, updateBackendValidations]);

  const validatorGroups = useRef<BackendFieldValidatorGroups>(initialValidatorGroups);

  // Function to update validators and propagate changes to validationcontext
  const setGroups = useCallback(
    (groups: BackendValidationIssueGroups, savedDataType: string) => {
      const newValidatorGroups = structuredClone(validatorGroups.current);

      for (const [group, validationIssues] of Object.entries(groups)) {
        newValidatorGroups[group] = mapBackendIssuesToFieldValdiations(validationIssues, getDataTypeForElementId);
      }

      if (deepEqual(validatorGroups.current, newValidatorGroups)) {
        // Dont update any validations, only set last saved validations
        updateBackendValidations({}, { dataType: savedDataType, processedLast: groups });
        return;
      }

      validatorGroups.current = newValidatorGroups;
      const backendValidations = mapValidatorGroupsToDataModelValidations(validatorGroups.current, dataTypes);
      updateBackendValidations(backendValidations, { dataType: savedDataType, processedLast: groups });
    },
    [dataTypes, getDataTypeForElementId, updateBackendValidations],
  );

  return (
    <>
      {dataTypes.map((dataType) => (
        <IndividualBackendValidation
          key={dataType}
          dataType={dataType}
          setGroups={setGroups}
        />
      ))}
    </>
  );
}
