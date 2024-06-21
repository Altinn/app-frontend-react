import React, { useCallback, useEffect, useMemo, useRef } from 'react';

import deepEqual from 'fast-deep-equal';

import type { BackendFieldValidatorGroups, BackendValidationIssueGroups, FieldValidations } from '..';

import { createContext } from 'src/core/contexts/context';
import { DataModels } from 'src/features/datamodel/DataModelsProvider';
import { FD } from 'src/features/formData/FormDataWrite';
import { mapBackendIssuesToFieldValdiations } from 'src/features/validation/backendValidation/backendValidationUtils';
import { Validation } from 'src/features/validation/validationContext';

function IndividualBackendValidation({ dataType }: { dataType: string }) {
  const setGroups = useSetGroups();
  const lastSaveValidations = FD.useLastSaveValidationIssues(dataType);

  useEffect(() => {
    if (lastSaveValidations) {
      setGroups(lastSaveValidations, dataType);
    }
  }, [dataType, lastSaveValidations, setGroups]);

  return null;
}

type ValidatorGroupMethods = {
  setGroups: (groups: BackendValidationIssueGroups, savedDataType: string) => void;
};

const { Provider, useCtx } = createContext<ValidatorGroupMethods>({
  name: 'ValidatorGroupsContext',
  required: true,
});

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

  // TODO(Datamodels): Set initial validations in ValidationContext state!

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
        updateBackendValidations({}, savedDataType, groups);
        return;
      }

      validatorGroups.current = newValidatorGroups;

      // Update backend validations
      const backendValidations: { [dataType: string]: FieldValidations } = {};

      // We need to clear all data types regardless if there are any validations or not
      // Otherwise it would not update if there are no validations for a data type any more
      for (const dataType of dataTypes) {
        backendValidations[dataType] = {};
      }

      // Map validator groups to validations per data type and field
      for (const group of Object.values(validatorGroups.current)) {
        for (const validation of group) {
          if (!backendValidations[validation.dataType][validation.field]) {
            backendValidations[validation.dataType][validation.field] = [];
          }
          backendValidations[validation.dataType][validation.field].push(validation);
        }
      }
      updateBackendValidations(backendValidations, savedDataType, groups);
    },
    [dataTypes, getDataTypeForElementId, updateBackendValidations],
  );

  return (
    <Provider value={{ setGroups }}>
      {dataTypes.map((dataType) => (
        <IndividualBackendValidation
          key={dataType}
          dataType={dataType}
        />
      ))}
    </Provider>
  );
}

const useSetGroups = () => useCtx().setGroups;
