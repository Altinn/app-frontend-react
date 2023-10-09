import { autoSaveSaga, saveFormDataSaga, submitFormSaga } from 'src/features/formData/submit/submitFormDataSagas';
import { deleteAttachmentReferenceSaga, updateFormDataSaga } from 'src/features/formData/update/updateFormDataSagas';
import { checkIfRuleShouldRunSaga } from 'src/features/formRules/checkRulesSagas';
import { createSagaSlice } from 'src/redux/sagaSlice';
import type {
  IDeleteAttachmentReference,
  IFetchFormData,
  IFetchFormDataFulfilled,
  IFormDataRejected,
  ISaveAction,
  ISubmitDataAction,
  IUpdateFormData,
} from 'src/features/formData/formDataTypes';
import type { IFormData, IFormDataState } from 'src/features/formData/index';
import type { ActionsFromSlice, MkActionType } from 'src/redux/sagaSlice';

export const initialState: IFormDataState = {
  formData: {},
  lastSavedFormData: {},
  unsavedChanges: false,
  saving: false,
  submitting: {
    id: '',
    state: 'inactive',
  },
  error: null,
  reFetch: false,
  pendingUrl: undefined,
};

export let FormDataActions: ActionsFromSlice<typeof formDataSlice>;
export const formDataSlice = () => {
  const slice = createSagaSlice((mkAction: MkActionType<IFormDataState>) => ({
    name: 'formData',
    initialState,
    actions: {
      fetch: mkAction<IFetchFormData>({
        reducer: (state) => {
          state.reFetch = true;
        },
      }),
      fetchPending: mkAction<{ url: string }>({
        reducer: (state, action) => {
          state.pendingUrl = action.payload.url;
        },
      }),
      fetchFulfilled: mkAction<IFetchFormDataFulfilled>({
        reducer: (state, action) => {
          const { formData, url } = action.payload;
          state.formData = formData;
          state.lastSavedFormData = formData;
          state.reFetch = false;
          if (state.pendingUrl === url) {
            state.pendingUrl = undefined;
          }
        },
      }),
      fetchRejected: mkAction<IFormDataRejected>({
        reducer: (state, action) => {
          const { error } = action.payload;
          state.error = error;
          state.reFetch = false;
        },
      }),
      setFulfilled: mkAction<IFetchFormDataFulfilled>({
        reducer: (state, action) => {
          const { formData } = action.payload;
          state.formData = formData;
        },
      }),
      submit: mkAction<ISubmitDataAction>({
        takeEvery: submitFormSaga,
        reducer: (state, action) => {
          const { componentId } = action.payload;
          state.submitting.id = componentId;
          state.submitting.state = 'pending';
        },
      }),
      submitFulfilled: mkAction<void>({
        reducer: (state) => {
          state.unsavedChanges = false;
        },
      }),
      submitRejected: mkAction<IFormDataRejected>({
        reducer: (state, action) => {
          const { error } = action.payload;
          state.error = error;
          state.submitting.id = '';
          state.submitting.state = 'inactive';
        },
      }),
      submitReady: mkAction<void>({
        reducer: (state) => {
          state.submitting.state = 'ready';
        },
      }),
      submitClear: mkAction<void>({
        reducer: (state) => {
          state.submitting.id = '';
          state.submitting.state = 'inactive';
        },
      }),
      savingStarted: mkAction<void>({
        reducer: (state) => {
          state.saving = true;
        },
      }),
      savingEnded: mkAction<{ model: IFormData }>({
        reducer: (state, action) => {
          state.saving = false;
          state.lastSavedFormData = action.payload.model;
        },
      }),
      update: mkAction<IUpdateFormData>({
        takeEvery: updateFormDataSaga,
      }),
      updateFulfilled: mkAction<IUpdateFormData>({
        takeEvery: [checkIfRuleShouldRunSaga, autoSaveSaga],
        reducer: (state, action) => {
          const { field, data, skipAutoSave } = action.payload;
          // Remove if data is null, undefined or empty string
          if (data === undefined || data === null || data === '') {
            delete state.formData[field];
          } else {
            state.formData[field] = data;
          }
          if (!skipAutoSave) {
            state.unsavedChanges = true;
          }
        },
      }),
      updateRejected: mkAction<IFormDataRejected>({
        reducer: (state, action) => {
          const { error } = action.payload;
          state.error = error;
        },
      }),
      saveEvery: mkAction<ISaveAction>({
        takeEvery: saveFormDataSaga,
      }),
      saveLatest: mkAction<ISaveAction>({
        takeLatest: saveFormDataSaga,
      }),
      deleteAttachmentReference: mkAction<IDeleteAttachmentReference>({
        takeEvery: deleteAttachmentReferenceSaga,
      }),
    },
  }));

  FormDataActions = slice.actions;
  return slice;
};
