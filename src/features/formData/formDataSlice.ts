import dot from 'dot-object';

import { checkIfRuleShouldRunSaga } from 'src/features/form/rules/checkRulesSagas';
import { autoSaveSaga, saveFormDataSaga, submitFormSaga } from 'src/features/formData/submit/submitFormDataSagas';
import { updateFormDataSaga } from 'src/features/formData/update/updateFormDataSagas';
import { createSagaSlice } from 'src/redux/sagaSlice';
import { convertDataBindingToModel } from 'src/utils/databindings';
import type {
  IFetchFormDataFulfilled,
  IFormDataRejected,
  ISaveAction,
  IUpdateFormDataAddToList,
  IUpdateFormDataRemoveFromList,
  IUpdateFormDataSimple,
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
      update: mkAction<IUpdateFormDataSimple>({
        takeEvery: updateFormDataSaga,
      }),
      updateFulfilled: mkAction<IUpdateFormDataSimple>({
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
      updateAddToList: mkAction<IUpdateFormDataAddToList>({
        takeEvery: [checkIfRuleShouldRunSaga, autoSaveSaga],
        reducer: (state, action) => {
          const { field, itemToAdd } = action.payload;

          // The list binding can be used to store array data. When the update action is called, it replaces
          // the entire array with the new data.
          let maxIndex = 0;
          for (const key of Object.keys(state.formData)) {
            if (key.startsWith(`${field}[`)) {
              const afterBracket = key.substring(field.length + 1);
              const index = parseInt(afterBracket.substring(0, afterBracket.indexOf(']')), 10);
              if (index > maxIndex) {
                maxIndex = index;
              }
            }
          }
          state.formData[`${field}[${maxIndex + 1}]`] = itemToAdd;
          state.unsavedChanges = true;
        },
      }),
      updateRemoveFromList: mkAction<IUpdateFormDataRemoveFromList>({
        takeEvery: [checkIfRuleShouldRunSaga, autoSaveSaga],
        reducer: (state, action) => {
          const { field, itemToRemove } = action.payload;
          const fullFormData = convertDataBindingToModel(state.formData);
          const existingList = dot.pick(field, fullFormData) || [];
          const newList = existingList.filter((item: string) => item !== itemToRemove);

          for (const key of Object.keys(state.formData)) {
            if (key.startsWith(`${field}[`)) {
              delete state.formData[key];
            }
          }
          for (let i = 0; i < newList.length; i++) {
            state.formData[`${field}[${i}]`] = newList[i];
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
