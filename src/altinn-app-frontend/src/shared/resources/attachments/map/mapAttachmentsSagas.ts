import { SagaIterator } from 'redux-saga';
import { call, select, take, takeLatest } from 'redux-saga/effects';
import { IData, IInstance } from 'altinn-shared/types';
import { IAttachments } from '..';
import { IRuntimeState } from 'src/types';
import { mapAttachmentListToAttachments } from 'src/utils/attachment';
import AttachmentDispatcher from '../attachmentActions';
import * as AttachmentActionsTypes from '../attachmentActionTypes';
import { IApplicationMetadata } from '../../applicationMetadata';
import { getCurrentTaskData } from 'src/utils/appMetadata';
import { IFormData } from "src/features/form/data/formDataReducer";
import FormDataActions from "src/features/form/data/formDataActions";

export function* watchMapAttachmentsSaga(): SagaIterator {
  yield takeLatest(AttachmentActionsTypes.MAP_ATTACHMENTS, mapAttachments);
}

export const selectAttachments = (state: IRuntimeState): IData[] => state.instanceData.instance.data;
const SelectInstance = (state: IRuntimeState): IInstance => state.instanceData.instance;
const SelectApplicationMetaData =
  (state: IRuntimeState): IApplicationMetadata => state.applicationMetadata.applicationMetadata;

export function* mapAttachments(): SagaIterator {
  try {
    yield take(FormDataActions.fetchFormDataFulfilled);

    const instance = yield select(SelectInstance);

    const applicationMetadata = yield select(SelectApplicationMetaData);

    const defaultElement = getCurrentTaskData(applicationMetadata, instance);

    const formData = yield select((state:IRuntimeState) : IFormData => state.formData.formData);

    const attachments: IData[] = yield select(selectAttachments);
    const mappedAttachments: IAttachments = mapAttachmentListToAttachments(
      attachments, defaultElement.id, formData
    );

    yield call(AttachmentDispatcher.mapAttachmentsFulfilled, mappedAttachments);
  } catch (err) {
    yield call(AttachmentDispatcher.mapAttachmentsRejected, err);
  }
}
