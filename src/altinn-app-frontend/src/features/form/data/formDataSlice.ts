import type {
  IFetchFormDataFulfilled,
  IFormDataRejected,
  ISubmitDataAction,
  IUpdateFormDataFulfilled,
  IFetchFormData,
  IDeleteAttachmentReference,
  IUpdateFormData,
} from 'src/features/form/data/formDataTypes';
import type { IFormDataState } from 'src/features/form/data/index';
import { FormLayoutActions } from 'src/features/form/layout/formLayoutSlice';
import type { AnyAction } from 'redux';
import { ProcessActions } from 'src/shared/resources/process/processSlice';
import type { MkActionType } from 'src/shared/resources/utils/sagaSlice';
import { createSagaSlice } from 'src/shared/resources/utils/sagaSlice';
import { checkIfRuleShouldRunSaga } from 'src/features/form/rules/check/checkRulesSagas';

const initialState: IFormDataState = {
  formData: {},
  error: null,
  responseInstance: null,
  unsavedChanges: false,
  isSubmitting: false,
  isSaving: false,
  hasSubmitted: false,
  ignoreWarnings: false,
};

const isProcessAction = (action: AnyAction) => {
  return (
    action.type === ProcessActions.completeFulfilled.type ||
    action.type === ProcessActions.completeRejected.type
  );
};

const formDataSlice = createSagaSlice(
  (mkAction: MkActionType<IFormDataState>) => ({
    name: 'formData',
    initialState,
    actions: {
      fetch: mkAction<IFetchFormData>({}),
      fetchInitial: mkAction<void>({}),
      fetchFulfilled: mkAction<IFetchFormDataFulfilled>({
        reducer: (state, action) => {
          const { formData } = action.payload;
          state.formData = formData;
        },
      }),
      setFulfilled: mkAction<IFetchFormDataFulfilled>({
        reducer: (state, action) => {
          const { formData } = action.payload;
          state.formData = formData;
        },
      }),
      fetchRejected: mkAction<IFormDataRejected>({
        reducer: (state, action) => {
          const { error } = action.payload;
          state.error = error;
        },
      }),
      submit: mkAction<ISubmitDataAction>({
        reducer: (state, action) => {
          const { apiMode } = action.payload;
          state.isSaving = apiMode !== 'Complete';
          state.isSubmitting = apiMode === 'Complete';
          state.hasSubmitted = apiMode === 'Complete';
        },
      }),
      submitFulfilled: mkAction<void>({
        reducer: (state) => {
          state.isSaving = false;
          state.unsavedChanges = false;
        },
      }),
      submitRejected: mkAction<IFormDataRejected>({
        reducer: (state, action) => {
          const { error } = action.payload;
          state.error = error;
          state.isSubmitting = false;
          state.isSaving = false;
          state.ignoreWarnings = true;
        },
      }),
      update: mkAction<IUpdateFormData>({
        reducer: (state) => {
          state.hasSubmitted = false;
          state.ignoreWarnings = false;
        },
      }),
      updateFulfilled: mkAction<IUpdateFormDataFulfilled>({
        takeLatest: checkIfRuleShouldRunSaga,
        reducer: (state, action) => {
          const { field, data } = action.payload;
          // Remove if data is null, undefined or empty string
          if (data === undefined || data === null || data === '') {
            delete state.formData[field];
          } else {
            state.formData[field] = data;
          }
          state.unsavedChanges = true;
        },
      }),
      updateRejected: mkAction<IFormDataRejected>({
        reducer: (state, action) => {
          const { error } = action.payload;
          state.error = error;
        },
      }),
      save: mkAction<void>({}),
      deleteAttachmentReference: mkAction<IDeleteAttachmentReference>({}),
    },
    extraReducers: (builder) => {
      builder
        .addCase(FormLayoutActions.updateCurrentView, (state) => {
          state.hasSubmitted = true;
        })
        .addCase(FormLayoutActions.updateCurrentViewFulfilled, (state) => {
          state.hasSubmitted = false;
        })
        .addMatcher(isProcessAction, (state) => {
          state.isSubmitting = false;
        })
        .addDefaultCase((state) => state);
    },
  }),
);

export const FormDataActions = formDataSlice.actions;
export default formDataSlice;
