import React, { useCallback, useEffect, useRef } from 'react';
import type { PropsWithChildren } from 'react';

import { createStore } from 'zustand';
import { immer } from 'zustand/middleware/immer';

import { createZustandContext } from 'src/core/contexts/zustandContext';
import { Loader } from 'src/core/loading/Loader';
import { useHasPendingAttachments } from 'src/features/attachments/AttachmentsContext';
import { FD } from 'src/features/formData/FormDataWrite';
import { useBackendValidation } from 'src/features/validation/backendValidation/useBackendValidation';
import { useExpressionValidation } from 'src/features/validation/expressionValidation/useExpressionValidation';
import { useInvalidDataValidation } from 'src/features/validation/invalidDataValidation/useInvalidDataValidation';
import { useNodeValidation } from 'src/features/validation/nodeValidation/useNodeValidation';
import { useSchemaValidation } from 'src/features/validation/schemaValidation/useSchemaValidation';
import {
  getVisibilityMask,
  hasValidationErrors,
  mergeFieldValidations,
  selectValidations,
} from 'src/features/validation/utils';
import { useVisibility } from 'src/features/validation/visibility/useVisibility';
import {
  onBeforeRowDelete,
  setVisibilityForAttachment,
  setVisibilityForNode,
} from 'src/features/validation/visibility/visibilityUtils';
import { useAsRef } from 'src/hooks/useAsRef';
import { useWaitForState } from 'src/hooks/useWaitForState';
import type {
  BackendValidationIssueGroups,
  BackendValidations,
  ComponentValidations,
  FieldValidations,
  ValidationContext,
} from 'src/features/validation';
import type { Visibility } from 'src/features/validation/visibility/visibilityUtils';

interface NewStoreProps {
  backendValidationsProcessedLastRef: React.MutableRefObject<BackendValidationIssueGroups | undefined>;
  validating: () => Promise<(lastBackendValidations: BackendValidationIssueGroups | undefined) => boolean>;
}

interface Internals {
  isLoading: boolean;
  individualValidations: {
    backend: BackendValidations;
    component: ComponentValidations;
    expression: FieldValidations;
    schema: FieldValidations;
    invalidData: FieldValidations;
  };
  updateValidations: <K extends keyof Internals['individualValidations']>(
    key: K,
    value: Internals['individualValidations'][K],
  ) => void;
  updateVisibility: (mutator: (visibility: Visibility) => void) => void;
}

function initialCreateStore({ validating }: NewStoreProps) {
  return createStore<ValidationContext & Internals>()(
    immer((set) => ({
      // =======
      // Publicly exposed state
      state: {
        task: [],
        fields: {},
        components: {},
      },
      visibility: {
        mask: 0,
        children: {},
        items: [],
      },
      backendValidationsProcessedLast: undefined,
      removeRowVisibilityOnDelete: (node, rowIndex) =>
        set((state) => {
          onBeforeRowDelete(node, rowIndex, state.visibility);
        }),
      setNodeVisibility: (nodes, newVisibility, rowIndex) =>
        set((state) => {
          nodes.forEach((node) => setVisibilityForNode(node, state.visibility, newVisibility, rowIndex));
        }),
      setAttachmentVisibility: (attachmentId, node, newVisibility) =>
        set((state) => {
          setVisibilityForAttachment(attachmentId, node, state.visibility, newVisibility);
        }),
      setShowAllErrors: (newValue) =>
        set((state) => {
          state.showAllErrors = newValue;
        }),
      showAllErrors: false,
      validating,

      // =======
      // Internal state
      isLoading: true,
      individualValidations: {
        backend: { task: [], fields: {} },
        component: {},
        expression: {},
        schema: {},
        invalidData: {},
      },
      updateValidations: (key, validations) =>
        set((state) => {
          if (key === 'backend') {
            state.isLoading = false;
            state.state.task = (validations as BackendValidations).task;
          }
          state.individualValidations[key] = validations;
          if (key === 'component') {
            state.state.components = validations as ComponentValidations;
          } else {
            state.state.fields = mergeFieldValidations(
              state.individualValidations.backend.fields,
              state.individualValidations.invalidData,
              state.individualValidations.schema,
              state.individualValidations.expression,
            );
          }
        }),
      updateVisibility: (mutator) =>
        set((state) => {
          mutator(state.visibility);
        }),
    })),
  );
}

const { Provider, useSelector } = createZustandContext({
  name: 'Validation',
  required: true,
  initialCreateStore,
});

interface Props {
  isCustomReceipt?: boolean;
}

export function ValidationProvider({ children, isCustomReceipt = false }: PropsWithChildren<Props>) {
  const waitForSave = FD.useWaitForSave();
  const backendValidationsProcessedLastRef = useRef<BackendValidationIssueGroups | undefined>(undefined);
  const waitForBackendValidations = useWaitForState(backendValidationsProcessedLastRef);
  const hasPendingAttachments = useHasPendingAttachments();

  // Provide a promise that resolves when all pending validations have been completed
  const pendingAttachmentsRef = useAsRef(hasPendingAttachments);
  const waitForAttachments = useWaitForState(pendingAttachmentsRef);

  const validating = useCallback(async () => {
    await waitForAttachments((state) => !state);

    // Wait until we've saved changed to backend, and we've processed the backend validations we got from that save
    const validationsFromSave = await waitForSave();
    await waitForBackendValidations((processedLast) => processedLast === validationsFromSave);

    // At last, return a function to the caller that can be used to check if their local state is up-to-date
    return (lastBackendValidations: BackendValidationIssueGroups | undefined) =>
      lastBackendValidations === validationsFromSave;
  }, [waitForAttachments, waitForBackendValidations, waitForSave]);

  return (
    <Provider
      backendValidationsProcessedLastRef={backendValidationsProcessedLastRef}
      validating={validating}
    >
      <UpdateValidations
        isCustomReceipt={isCustomReceipt}
        backendValidationsProcessedLastRef={backendValidationsProcessedLastRef}
      />
      <ManageVisibility />
      <LoadingBlocker isCustomReceipt={isCustomReceipt}>{children}</LoadingBlocker>
    </Provider>
  );
}

function LoadingBlocker({ children, isCustomReceipt }: PropsWithChildren<Props>) {
  const isLoading = useSelector((state) => state.isLoading);
  if (isLoading && !isCustomReceipt) {
    return <Loader reason='validation' />;
  }

  return <>{children}</>;
}

interface UpdateValidationsProps extends Props {
  backendValidationsProcessedLastRef: React.MutableRefObject<BackendValidationIssueGroups | undefined>;
}

function UpdateValidations({ isCustomReceipt, backendValidationsProcessedLastRef }: UpdateValidationsProps) {
  const updateValidations = useSelector((state) => state.updateValidations);
  const {
    validations: backendValidations,
    processedLast,
    initialValidationDone,
  } = useBackendValidation({ enabled: !isCustomReceipt });
  backendValidationsProcessedLastRef.current = processedLast;

  useEffect(() => {
    if (initialValidationDone) {
      updateValidations('backend', backendValidations);
    }
  }, [backendValidations, initialValidationDone, updateValidations]);

  const componentValidations = useNodeValidation();
  const expressionValidations = useExpressionValidation();
  const schemaValidations = useSchemaValidation();
  const invalidDataValidations = useInvalidDataValidation();

  useEffect(() => {
    updateValidations('component', componentValidations);
  }, [componentValidations, updateValidations]);

  useEffect(() => {
    updateValidations('expression', expressionValidations);
  }, [expressionValidations, updateValidations]);

  useEffect(() => {
    updateValidations('schema', schemaValidations);
  }, [schemaValidations, updateValidations]);

  useEffect(() => {
    updateValidations('invalidData', invalidDataValidations);
  }, [invalidDataValidations, updateValidations]);

  return null;
}

function ManageVisibility() {
  const validations = useSelector((state) => state.state);
  const setVisibility = useSelector((state) => state.updateVisibility);
  const showAllErrors = useSelector((state) => state.showAllErrors);
  const setShowAllErrors = useSelector((state) => state.setShowAllErrors);

  useVisibility(validations, setVisibility);

  /**
   * Hide unbound errors as soon as possible.
   */
  useEffect(() => {
    if (showAllErrors) {
      const backendMask = getVisibilityMask(['Backend', 'CustomBackend']);
      const hasFieldErrors =
        Object.values(validations.fields).flatMap((field) => selectValidations(field, backendMask, 'error')).length > 0;

      if (!hasFieldErrors && !hasValidationErrors(validations.task)) {
        setShowAllErrors(false);
      }
    }
  }, [setShowAllErrors, showAllErrors, validations.fields, validations.task]);

  return null;
}

export const useValidationContext = () => useSelector((state) => state);
export const useOnDeleteGroupRow = () => useSelector((state) => state.removeRowVisibilityOnDelete);
