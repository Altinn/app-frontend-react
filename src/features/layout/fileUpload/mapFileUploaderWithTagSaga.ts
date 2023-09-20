import { select } from 'redux-saga/effects';
import type { SagaIterator } from 'redux-saga';

import { selectAttachmentState, selectFormLayouts } from 'src/features/layout/update/updateFormLayoutSagas';
import { mapFileUploadersWithTag } from 'src/utils/formLayout';
import type { IAttachmentState } from 'src/features/attachments';
import type { IFileUploadersWithTag } from 'src/types';

// TODO: Remove this
export function* mapFileUploaderWithTagSaga(): SagaIterator {
  const attachmentState: IAttachmentState = yield select(selectAttachmentState);
  const layouts = yield select(selectFormLayouts);
  let newUploads: IFileUploadersWithTag = {};
  Object.keys(layouts).forEach((layoutKey: string) => {
    newUploads = {
      ...newUploads,
      ...mapFileUploadersWithTag(layouts[layoutKey], attachmentState),
    };
  });
}
