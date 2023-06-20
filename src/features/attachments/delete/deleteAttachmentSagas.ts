import { call, put, select } from 'redux-saga/effects';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { AxiosResponse } from 'axios';
import type { SagaIterator } from 'redux-saga';

import { AttachmentActions } from 'src/features/attachments/attachmentSlice';
import { FormDataActions } from 'src/features/formData/formDataSlice';
import { ValidationActions } from 'src/features/validation/validationSlice';
import { getFileUploadComponentValidations } from 'src/utils/formComponentUtils';
import { httpDelete } from 'src/utils/network/networking';
import { dataElementUrl } from 'src/utils/urls/appUrlHelper';
import type { IDeleteAttachmentAction } from 'src/features/attachments/delete/deleteAttachmentActions';
import type { IRuntimeState } from 'src/types';

export function* deleteAttachmentSaga({
  payload: { attachment, attachmentType, componentId, dataModelBindings },
}: PayloadAction<IDeleteAttachmentAction>): SagaIterator {
  const language = yield select((s: IRuntimeState) => s.language.language);
  const currentView: string = yield select((s: IRuntimeState) => s.formLayout.uiConfig.currentView);

  try {
    // Sets validations to empty.
    const newValidations = getFileUploadComponentValidations(null, {});
    yield put(
      ValidationActions.updateComponentValidations({
        componentId,
        pageKey: currentView,
        validationResult: { validations: newValidations },
      }),
    );

    const response: AxiosResponse = yield call(httpDelete, dataElementUrl(attachment.id));
    if (response.status === 200) {
      if (dataModelBindings && (dataModelBindings.simpleBinding || dataModelBindings.list)) {
        yield put(
          FormDataActions.deleteAttachmentReference({
            attachmentId: attachment.id,
            componentId,
            dataModelBindings,
          }),
        );
      }
      yield put(
        AttachmentActions.deleteAttachmentFulfilled({
          attachmentId: attachment.id,
          attachmentType,
          componentId,
        }),
      );
    } else {
      throw new Error(`Got error response when deleting attachment: ${response.status}`);
    }
  } catch (err) {
    const validations = getFileUploadComponentValidations('delete', language);
    yield put(
      ValidationActions.updateComponentValidations({
        componentId,
        pageKey: currentView,
        validationResult: { validations },
      }),
    );
    yield put(
      AttachmentActions.deleteAttachmentRejected({
        attachment,
        attachmentType,
        componentId,
      }),
    );
    console.error(err);
  }
}
