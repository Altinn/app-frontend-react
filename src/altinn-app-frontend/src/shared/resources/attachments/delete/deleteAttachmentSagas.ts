import { SagaIterator } from 'redux-saga';
import { call, put, select, takeEvery } from 'redux-saga/effects';
import { updateComponentValidations } from 'src/features/form/validation/validationSlice';
import { getFileUploadComponentValidations } from '../../../../utils/formComponentUtils';
import { IRuntimeState } from '../../../../types';
import { httpDelete } from '../../../../utils/networking';
import { dataElementUrl } from '../../../../utils/appUrlHelper';
import AttachmentDispatcher from '../attachmentActions';
import * as AttachmentActionsTypes from '../attachmentActionTypes';
import * as deleteActions from './deleteAttachmentActions';
import FormDataActions from "src/features/form/data/formDataActions";

export function* watchDeleteAttachmentSaga(): SagaIterator {
  yield takeEvery(AttachmentActionsTypes.DELETE_ATTACHMENT, deleteAttachmentSaga);
}

export function* deleteAttachmentSaga({
  attachment,
  attachmentType,
  componentId,
  dataModelBindings,
  index,
}: deleteActions.IDeleteAttachmentAction): SagaIterator {
  const language = yield select((s:IRuntimeState) => s.language.language);
  const currentView:string = yield select((s:IRuntimeState) => s.formLayout.uiConfig.currentView);

  try {
    // Sets validations to empty.
    const newValidations = getFileUploadComponentValidations(null, null);
    yield put(updateComponentValidations({
      componentId,
      layoutId: currentView,
      validations: newValidations,
    }));

    const response: any = yield call(httpDelete, dataElementUrl(attachment.id));
    if (response.status === 200) {
      if (dataModelBindings) {
        yield put(FormDataActions.deleteAttachmentReference({
          componentId,
          index,
          dataModelBindings,
        }));
      }
      yield call(AttachmentDispatcher.deleteAttachmentFulfilled, attachment.id, attachmentType, componentId);
    } else {
      const validations = getFileUploadComponentValidations('delete', language);
      yield put(updateComponentValidations({
        componentId,
        layoutId: currentView,
        validations,
      }));
      yield call(AttachmentDispatcher.deleteAttachmentRejected,
        attachment, attachmentType, componentId);
    }
  } catch (err) {
    const validations = getFileUploadComponentValidations('delete', language);
    yield put(updateComponentValidations({
      componentId,
      layoutId: currentView,
      validations,
    }));
    yield call(AttachmentDispatcher.deleteAttachmentRejected,
      attachment, attachmentType, componentId);
    console.error(err);
  }
}
