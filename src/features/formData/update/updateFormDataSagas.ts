import { put, select } from 'redux-saga/effects';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { SagaIterator } from 'redux-saga';

import { FormDataActions } from 'src/features/formData/formDataSlice';
import { removeAttachmentReference } from 'src/utils/databindings';
import type { IAttachments } from 'src/features/attachments';
import type { IFormData } from 'src/features/formData';
import type { IDeleteAttachmentReference, IUpdateFormData } from 'src/features/formData/formDataTypes';
import type { IRuntimeState } from 'src/types';

export function* updateFormDataSaga({
  payload: { field, data, componentId, skipValidation, skipAutoSave, singleFieldValidation },
}: PayloadAction<IUpdateFormData>): SagaIterator {
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

function shouldUpdateFormData(currentData: any, newData: any): boolean {
  if (newData && newData !== '' && !currentData) {
    return true;
  }

  return currentData !== newData;
}

export const SelectFormData = (s: IRuntimeState) => s.formData.formData;
export const SelectAttachments = (s: IRuntimeState) => s.attachments.attachments;

export function* deleteAttachmentReferenceSaga({
  payload: { attachmentId, componentId, dataModelBindings },
}: PayloadAction<IDeleteAttachmentReference>): SagaIterator {
  try {
    const formData: IFormData = yield select(SelectFormData);
    const attachments: IAttachments = yield select(SelectAttachments);

    const updatedFormData = removeAttachmentReference(
      formData,
      attachmentId,
      attachments,
      dataModelBindings,
      componentId,
    );

    yield put(FormDataActions.setFulfilled({ formData: updatedFormData }));
    yield put(FormDataActions.saveEvery({ componentId }));
  } catch (err) {
    window.logError('Delete attachment reference failed:\n', err);
  }
}
