import React, { useCallback, useEffect } from 'react';
import type { PropsWithChildren } from 'react';

import { createStore } from 'zustand';
import { immer } from 'zustand/middleware/immer';

import { createZustandContext } from 'src/core/contexts/zustandContext';
import { Loader } from 'src/core/loading/Loader';
import { useHasPendingAttachments } from 'src/features/attachments/hooks';
import { DataModels } from 'src/features/datamodel/DataModelsProvider';
import { FD } from 'src/features/formData/FormDataWrite';
import { BackendValidation } from 'src/features/validation/backendValidation/BackendValidation';
import { useShouldValidateInitial } from 'src/features/validation/backendValidation/backendValidationUtils';
import { ExpressionValidation } from 'src/features/validation/expressionValidation/ExpressionValidation';
import { InvalidDataValidation } from 'src/features/validation/invalidDataValidation/InvalidDataValidation';
import { SchemaValidation } from 'src/features/validation/schemaValidation/SchemaValidation';
import {
  getVisibilityMask,
  hasValidationErrors,
  mergeFieldValidations,
  selectValidations,
} from 'src/features/validation/utils';
import { useAsRef } from 'src/hooks/useAsRef';
import { useIsPdf } from 'src/hooks/useIsPdf';
import { useWaitForState } from 'src/hooks/useWaitForState';
import { NodesInternal } from 'src/utils/layout/NodesContext';
import type {
  BackendValidationIssueGroups,
  BaseValidation,
  DataModelValidations,
  FieldValidations,
  LastValidationInfo,
  ValidationContext,
  WaitForValidation,
} from 'src/features/validation';

interface Internals {
  isLoading: boolean;
  individualValidations: {
    backend: DataModelValidations;
    expression: DataModelValidations;
    schema: DataModelValidations;
    invalidData: DataModelValidations;
  };
  issueGroupsProcessedLast: { [dataType: string]: BackendValidationIssueGroups | undefined };
  updateTaskValidations: (validations: BaseValidation[]) => void;
  /**
   * updateDataModelValidations
   * if validations is undefined, nothing will be changed
   */
  updateDataModelValidations: (
    key: Exclude<keyof Internals['individualValidations'], 'backend'>,
    dataType: string,
    validations?: FieldValidations,
  ) => void;
  updateBackendValidations: (
    backendValidations: { [dataType: string]: FieldValidations },
    validationInfo?: LastValidationInfo,
  ) => void;
  updateValidating: (validating: WaitForValidation) => void;
}

function initialCreateStore() {
  return createStore<ValidationContext & Internals>()(
    immer((set) => ({
      // =======
      // Publicly exposed state
      state: {
        task: [],
        dataModels: {},
      },
      setShowAllErrors: (newValue) =>
        set((state) => {
          state.showAllErrors = newValue;
        }),
      showAllErrors: false,
      validating: undefined,

      // =======
      // Internal state
      isLoading: true,
      individualValidations: {
        backend: {},
        expression: {},
        schema: {},
        invalidData: {},
      },
      issueGroupsProcessedLast: {},
      updateTaskValidations: (validations) =>
        set((state) => {
          state.state.task = validations;
        }),
      updateDataModelValidations: (key, dataType, validations) =>
        set((state) => {
          if (validations) {
            state.individualValidations[key][dataType] = validations;
            state.state.dataModels[dataType] = mergeFieldValidations(
              state.individualValidations.backend[dataType],
              state.individualValidations.invalidData[dataType],
              state.individualValidations.schema[dataType],
              state.individualValidations.expression[dataType],
            );
          }
        }),
      updateBackendValidations: (backendValidations, validationInfo) =>
        set((state) => {
          if (validationInfo) {
            state.issueGroupsProcessedLast[validationInfo.dataType] = validationInfo.processedLast;
          }
          for (const [dataType, validations] of Object.entries(backendValidations)) {
            state.individualValidations.backend[dataType] = validations;
            state.state.dataModels[dataType] = mergeFieldValidations(
              state.individualValidations.backend[dataType],
              state.individualValidations.invalidData[dataType],
              state.individualValidations.schema[dataType],
              state.individualValidations.expression[dataType],
            );
          }
        }),
      updateValidating: (newValidating) =>
        set((state) => {
          state.validating = newValidating;
        }),
    })),
  );
}

const { Provider, useSelector, useLaxSelector, useSelectorAsRef, useStore, useLaxSelectorAsRef, useDelayedSelector } =
  createZustandContext({
    name: 'Validation',
    required: true,
    initialCreateStore,
  });

export function ValidationProvider({ children }: PropsWithChildren) {
  const writableDataTypes = DataModels.useWritableDataTypes();
  return (
    <Provider>
      {writableDataTypes.map((dataType) => (
        <>
          <SchemaValidation dataType={dataType} />
          <ExpressionValidation dataType={dataType} />
          <InvalidDataValidation dataType={dataType} />
        </>
      ))}
      <BackendValidation dataTypes={writableDataTypes} />
      <ManageShowAllErrors />
      <LoadingBlocker>{children}</LoadingBlocker>
    </Provider>
  );
}

function useWaitForValidation(): WaitForValidation {
  const waitForNodesReady = NodesInternal.useWaitUntilReady();
  const waitForSave = FD.useWaitForSave();
  const waitForState = useWaitForState<never, ValidationContext & Internals>(useStore());
  const hasPendingAttachments = useHasPendingAttachments();

  // Provide a promise that resolves when all pending validations have been completed
  const pendingAttachmentsRef = useAsRef(hasPendingAttachments);
  const waitForAttachments = useWaitForState(pendingAttachmentsRef);

  const hasWritableDataTypes = !!DataModels.useWritableDataTypes()?.length;
  const isPDF = useIsPdf();

  return useCallback(
    async (forceSave = true) => {
      if (isPDF || !hasWritableDataTypes) {
        return;
      }

      await waitForAttachments((state) => !state);

      // Wait until we've saved changed to backend, and we've processed the backend validations we got from that save
      await waitForNodesReady();
      const validationsFromSave = await waitForSave(forceSave);
      await waitForNodesReady();
      await waitForState((state) =>
        Object.keys(state.issueGroupsProcessedLast).every(
          (dataType) => state.issueGroupsProcessedLast[dataType] === validationsFromSave?.[dataType],
        ),
      );
    },
    [isPDF, hasWritableDataTypes, waitForAttachments, waitForNodesReady, waitForSave, waitForState],
  );
}

export function ProvideWaitForValidation() {
  const validate = useWaitForValidation();
  const updateValidating = useSelector((state) => state.updateValidating);

  useEffect(() => {
    updateValidating(validate);
  }, [updateValidating, validate]);

  return null;
}

export function LoadingBlockerWaitForValidation({ children }: PropsWithChildren) {
  const validating = useSelector((state) => state.validating);
  const shouldValidateInitial = useShouldValidateInitial();
  if (!validating && shouldValidateInitial) {
    return <Loader reason='validation-awaiter' />;
  }

  return <>{children}</>;
}

function LoadingBlocker({ children }: PropsWithChildren) {
  const isLoading = useSelector((state) => state.isLoading);
  const shouldValidateInitial = useShouldValidateInitial();

  if (isLoading && shouldValidateInitial) {
    return <Loader reason='validation' />;
  }

  return <>{children}</>;
}

function ManageShowAllErrors() {
  const showAllErrors = useSelector((state) => state.showAllErrors);
  return showAllErrors ? <UpdateShowAllErrors /> : null;
}

function UpdateShowAllErrors() {
  const taskValidations = useSelector((state) => state.state.task);
  const dataModelValidations = useSelector((state) => state.state.dataModels);
  const setShowAllErrors = useSelector((state) => state.setShowAllErrors);

  /**
   * Hide unbound errors as soon as possible.
   */
  useEffect(() => {
    const backendMask = getVisibilityMask(['Backend', 'CustomBackend']);
    const hasFieldErrors =
      Object.values(dataModelValidations)
        .flatMap((fields) => Object.values(fields))
        .flatMap((field) => selectValidations(field, backendMask, 'error')).length > 0;

    if (!hasFieldErrors && !hasValidationErrors(taskValidations)) {
      setShowAllErrors(false);
    }
  }, [dataModelValidations, setShowAllErrors, taskValidations]);

  return null;
}

/**
 * This hook returns a function that lets you select one or more fields from the validation state. The hook will
 * only force a re-render if the selected fields have changed.
 */
function useDS<U>(outerSelector: (state: ValidationContext) => U) {
  return useDelayedSelector({
    mode: 'innerSelector',
    makeArgs: (state) => [outerSelector(state)],
  });
}

export type ValidationSelector = ReturnType<typeof Validation.useSelector>;
export type ValidationDataModelSelector = ReturnType<typeof Validation.useDataModelSelector>;

export const Validation = {
  useFullStateRef: () => useSelectorAsRef((state) => state.state),

  // Selectors. These are memoized, so they won't cause a re-render unless the selected fields change.
  useSelector: () => useDS((state) => state),
  useDataModelSelector: () => useDS((state) => state.state.dataModels),

  useSetShowAllErrors: () => useSelector((state) => state.setShowAllErrors),
  useValidating: () => useSelector((state) => state.validating!),
  useUpdateTaskValidations: () => useLaxSelector((state) => state.updateTaskValidations),
  useUpdateDataModelValidations: () => useSelector((state) => state.updateDataModelValidations),
  useUpdateBackendValidations: () => useSelector((state) => state.updateBackendValidations),

  useRef: () => useSelectorAsRef((state) => state),
  useLaxRef: () => useLaxSelectorAsRef((state) => state),
};
