import { put, select } from 'redux-saga/effects';
import type { SagaIterator } from 'redux-saga';

import { AttachmentActions } from 'src/features/attachments/attachmentSlice';
import { getCurrentTaskData } from 'src/utils/appMetadata';
import { getKeyIndex } from 'src/utils/databindings';
import type { IApplicationMetadata } from 'src/features/applicationMetadata';
import type { IAttachments } from 'src/features/attachments';
import type { IFormData } from 'src/features/formData';
import type { ILayouts } from 'src/layout/layout';
import type { ILayoutSets, IRuntimeState } from 'src/types';
import type { IData, IInstance } from 'src/types/shared';

export const SelectInstanceData = (state: IRuntimeState): IData[] | undefined => state.instanceData.instance?.data;
export const SelectInstance = (state: IRuntimeState): IInstance | null => state.instanceData.instance;
export const SelectApplicationMetaData = (state: IRuntimeState): IApplicationMetadata | null =>
  state.applicationMetadata.applicationMetadata;
export const SelectFormData = (state: IRuntimeState): IFormData => state.formData.formData;
export const SelectFormLayouts = (state: IRuntimeState): ILayouts | null => state.formLayout.layouts;
export const SelectFormLayoutSets = (state: IRuntimeState): ILayoutSets | null => state.formLayout.layoutsets;

export function mapAttachmentListToAttachments(
  data: IData[],
  defaultElementId: string | undefined,
  formData: IFormData,
  layouts: ILayouts,
): IAttachments {
  const attachments: IAttachments = {};
  const allComponents = Object.values(layouts).flat();

  data.forEach((element: IData) => {
    const baseComponentId = element.dataType;
    if (element.id === defaultElementId || baseComponentId === 'ref-data-as-pdf') {
      return;
    }

    const component = allComponents.find((c) => c?.id === baseComponentId);
    if (!component || (component.type !== 'FileUpload' && component.type !== 'FileUploadWithTag')) {
      return;
    }

    let [key, index] = convertToDashedComponentId(
      baseComponentId,
      formData,
      element.id,
      component.maxNumberOfAttachments > 1,
    );

    if (!key) {
      key = baseComponentId;
      index = attachments[key]?.length || 0;
    }

    if (!attachments[key]) {
      attachments[key] = [];
    }

    attachments[key][index] = {
      uploaded: true,
      deleting: false,
      updating: false,
      name: element.filename,
      size: element.size,
      tags: element.tags,
      id: element.id,
    };
  });

  return attachments;
}

function convertToDashedComponentId(
  baseComponentId: string,
  formData: IFormData,
  attachmentUuid: string,
  hasIndex: boolean,
): [string, number] {
  const formDataKey = Object.keys(formData).find((key) => formData[key] === attachmentUuid);

  if (!formDataKey) {
    return ['', 0];
  }

  const groups = getKeyIndex(formDataKey);
  let componentId: string;
  let index: number;
  if (hasIndex) {
    const groupSuffix = groups.length > 1 ? `-${groups.slice(0, groups.length - 1).join('-')}` : '';

    componentId = `${baseComponentId}${groupSuffix}`;
    index = groups[groups.length - 1];
  } else {
    const groupSuffix = groups.length ? `-${groups.join('-')}` : '';

    componentId = `${baseComponentId}${groupSuffix}`;
    index = 0;
  }

  return [componentId, index];
}

export function* mapAttachments(): SagaIterator {
  try {
    const instance = yield select(SelectInstance);
    const applicationMetadata = yield select(SelectApplicationMetaData);
    const layoutSets: ILayoutSets = yield select(SelectFormLayoutSets);
    const defaultElement = getCurrentTaskData(applicationMetadata, instance, layoutSets);

    const formData = yield select(SelectFormData);
    const layouts = yield select(SelectFormLayouts);

    const instanceAttachments: IData[] = yield select(SelectInstanceData);
    const mappedAttachments: IAttachments = mapAttachmentListToAttachments(
      instanceAttachments,
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
