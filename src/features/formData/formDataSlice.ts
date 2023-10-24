import { checkIfRuleShouldRunSaga } from 'src/features/form/rules/checkRulesSagas';
import { autoSaveSaga, saveFormDataSaga, submitFormSaga } from 'src/features/formData/submit/submitFormDataSagas';
import { updateFormDataSaga } from 'src/features/formData/update/updateFormDataSagas';
import { createSagaSlice } from 'src/redux/sagaSlice';
import type {
  IFetchFormDataFulfilled,
  IFormDataRejected,
  ISaveAction,
  IUpdateFormData,
} from 'src/features/formData/formDataTypes';
import type { IFormData, IFormDataState } from 'src/features/formData/index';
import type { ActionsFromSlice, MkActionType } from 'src/redux/sagaSlice';

export const initialState: IFormDataState = {
  formData: {},
  lastSavedFormData: {},
  unsavedChanges: false,
  saving: false,
  submittingState: 'inactive',
  error: null,
  reFetch: false,
};

export let FormDataActions: ActionsFromSlice<typeof formDataSlice>;
export const formDataSlice = () => {
  const slice = createSagaSlice((mkAction: MkActionType<IFormDataState>) => ({
    name: 'formData',
    initialState,
    actions: {
      fetch: mkAction<void>({
        reducer: (state) => {
          state.reFetch = true;
        },
      }),
      fetchFulfilled: mkAction<IFetchFormDataFulfilled>({
        reducer: (state, action) => {
          const { formData } = action.payload;
          state.formData = formData;
          state.lastSavedFormData = formData;
          state.reFetch = false;
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
      submit: mkAction<void>({
        takeEvery: submitFormSaga,
        reducer: (state) => {
          state.submittingState = 'validating';
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
          state.submittingState = 'inactive';
        },
      }),
      submitReady: mkAction<void>({
        reducer: (state) => {
          state.submittingState = 'validationSuccessful';
        },
      }),
      submitClear: mkAction<void>({
        reducer: (state) => {
          state.submittingState = 'inactive';
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
          } else if (Array.isArray(data)) {
            // The list binding can be used to store array data. When the update action is called, it replaces
            // the entire array with the new data.
            for (const key of Object.keys(state.formData)) {
              if (key.startsWith(`${field}[`)) {
                delete state.formData[key];
              }
            }
            for (let i = 0; i < data.length; i++) {
              state.formData[`${field}[${i}]`] = data[i];
            }
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
    },
  }));

  FormDataActions = slice.actions;
  return slice;
};
