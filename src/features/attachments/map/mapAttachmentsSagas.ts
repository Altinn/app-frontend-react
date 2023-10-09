import { put, select } from 'redux-saga/effects';
import type { SagaIterator } from 'redux-saga';

import { AttachmentActions } from 'src/features/attachments/attachmentSlice';
import { tmpSagaInstanceData } from 'src/features/instance/InstanceContext';
import { getCurrentTaskData } from 'src/utils/appMetadata';
import { mapAttachmentListToAttachments } from 'src/utils/attachment';
import { waitFor } from 'src/utils/sagas';
import type { IApplicationMetadata } from 'src/features/applicationMetadata';
import type { IAttachments } from 'src/features/attachments';
import type { IFormData } from 'src/features/formData';
import type { ILayouts } from 'src/layout/layout';
import type { ILayoutSets, IRuntimeState } from 'src/types';
import type { IInstance } from 'src/types/shared';

export const SelectApplicationMetaData = (state: IRuntimeState): IApplicationMetadata | null =>
  state.applicationMetadata.applicationMetadata;
export const SelectFormData = (state: IRuntimeState): IFormData => state.formData.formData;
export const SelectFormLayouts = (state: IRuntimeState): ILayouts | null => state.formLayout.layouts;
export const SelectFormLayoutSets = (state: IRuntimeState): ILayoutSets | null => state.formLayout.layoutsets;

export function* mapAttachments(): SagaIterator {
  try {
    yield waitFor((state) => SelectApplicationMetaData(state) !== null);
    yield waitFor((state) => SelectFormLayouts(state) !== null);
    yield waitFor((state) => SelectFormData(state) !== null);
    const instance = tmpSagaInstanceData.current as IInstance;
    const formData = yield select(SelectFormData);
    const applicationMetadata = yield select(SelectApplicationMetaData);
    const layoutSets: ILayoutSets = yield select(SelectFormLayoutSets);
    const layouts = yield select(SelectFormLayouts);

    const defaultElement = getCurrentTaskData(applicationMetadata, instance, layoutSets);
    const instanceData = instance.data;
    const mappedAttachments: IAttachments = mapAttachmentListToAttachments(
      instanceData,
      defaultElement?.id,
      formData,
      layouts,
    );

    yield put(
      AttachmentActions.mapAttachmentsFulfilled({
        attachments: mappedAttachments,
      }),
    );
  } catch (error) {
    yield put(AttachmentActions.mapAttachmentsRejected({ error }));
    window.logError('Mapping attachments failed:\n', error);
  }
}
