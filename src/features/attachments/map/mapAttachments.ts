import { useEffect } from 'react';

import deepEqual from 'fast-deep-equal';

import { AttachmentActions } from 'src/features/attachments/attachmentSlice';
import { useAppDispatch } from 'src/hooks/useAppDispatch';
import { useAppSelector } from 'src/hooks/useAppSelector';
import { getCurrentTaskData } from 'src/utils/appMetadata';
import { getKeyIndex } from 'src/utils/databindings';
import type { IAttachments } from 'src/features/attachments';
import type { IFormData } from 'src/features/formData';
import type { ILayouts } from 'src/layout/layout';
import type { IData } from 'src/types/shared';

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

function useMappedAttachments() {
  const applicationMetadata = useAppSelector((state) => state.applicationMetadata.applicationMetadata);
  const layoutSets = useAppSelector((state) => state.formLayout.layoutsets);
  const formData = useAppSelector((state) => state.formData.formData);
  const layouts = useAppSelector((state) => state.formLayout.layouts);
  const instance = useAppSelector((state) => state.instanceData.instance);
  const instanceAttachments = useAppSelector((state) => state.instanceData.instance?.data);

  const defaultElement =
    applicationMetadata &&
    instance &&
    instance.data &&
    layoutSets &&
    getCurrentTaskData(applicationMetadata, instance, layoutSets);

  if (instanceAttachments && layouts && defaultElement?.id) {
    return mapAttachmentListToAttachments(instanceAttachments, defaultElement.id, formData, layouts);
  }

  return undefined;
}

export function useMappedAttachmentsGenerator() {
  const dispatch = useAppDispatch();
  const currentState = useAppSelector((state) => state.attachments.attachments);
  const initializedFor = useAppSelector((state) => state.attachments.initializedFor);
  const attachments = useMappedAttachments();
  const instanceAttachments = useAppSelector((state) => state.instanceData.instance?.data);

  // Using a shortened list of attachment ids to check for changes
  const shortList =
    instanceAttachments?.reduce((acc, attachment) => acc + attachment.id.substring(0, 5), 'ids:') || 'ids:none';

  useEffect(() => {
    if (attachments && (!deepEqual(attachments, currentState) || initializedFor !== shortList)) {
      dispatch(AttachmentActions.mapAttachmentsFulfilled({ attachments, initializedFor: shortList }));
    }
  }, [attachments, currentState, dispatch, shortList, initializedFor]);
}
