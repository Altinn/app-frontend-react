import { put, select } from 'redux-saga/effects';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { SagaIterator } from 'redux-saga';

import { FormDataActions } from 'src/features/formData/formDataSlice';
import type { IUpdateFormDataSimple } from 'src/features/formData/formDataTypes';
import type { IRuntimeState } from 'src/types';

export function* updateFormDataSaga({
  payload: { field, data, componentId, skipValidation, skipAutoSave, singleFieldValidation },
}: PayloadAction<IUpdateFormDataSimple>): SagaIterator {
  try {
    const state: IRuntimeState = yield select();

    if (shouldUpdateFormData(state.formData.formData[field], data)) {
      yield put(
        FormDataActions.updateFulfilled({
          field,
          componentId,
          data,
          skipValidation,
          skipAutoSave,
          singleFieldValidation,
        }),
      );
    }
  } catch (error) {
    window.logError('Update form data failed:\n', error);
    yield put(FormDataActions.updateRejected({ error }));
  }
}

function shouldUpdateFormData(currentData: string | null | undefined, newData: string | null | undefined): boolean {
  if (newData && newData !== '' && !currentData) {
    return true;
  }

  return currentData !== newData;
}
