import React, { useMemo } from 'react';
import type { PropsWithChildren } from 'react';

import { useImmerReducer } from 'use-immer';
import { v4 as uuidv4 } from 'uuid';
import type { AxiosRequestConfig } from 'axios';
import type { WritableDraft } from 'immer/dist/types/types-external';

import { useMappedAttachments } from 'src/features/attachments/map/mapAttachments';
import { createStrictContext } from 'src/utils/createContext';
import { httpPost } from 'src/utils/network/networking';
import { fileUploadUrl } from 'src/utils/urls/appUrlHelper';
import { customEncodeURI } from 'src/utils/urls/urlHelper';
import type {
  AttachmentActionUpload,
  IAttachment,
  IAttachments,
  IAttachmentsCtx,
  TemporaryAttachment,
} from 'src/features/attachments/index';
import type { LayoutNode } from 'src/utils/layout/LayoutNode';

const { Provider, useCtx } = createStrictContext<IAttachmentsCtx>();

interface ActionUpload extends AttachmentActionUpload {
  temporaryId: string;
}

interface ActionRemove {
  action: 'remove';
  node: LayoutNode<'FileUploadWithTag' | 'FileUpload'>;
  temporaryId: string;
}

type InternalActions = ActionUpload | ActionRemove;

// TODO: Remove this when no sagas, etc, are using it
export const tmpSagaAttachmentsData: { current: IAttachments | null } = { current: null };

function reducer(draft: WritableDraft<IAttachments<TemporaryAttachment>>, action: InternalActions) {
  const { node, temporaryId } = action;
  const { id } = node.item;

  if (action.action === 'upload') {
    const { file } = action;
    draft[id] = draft[id] || [];
    (draft[id] as IAttachment[]).push({
      uploaded: false,
      updating: false,
      deleting: false,
      data: {
        temporaryId,
        filename: file.name,
        size: file.size,
      },
    });
  } else if (action.action === 'remove') {
    const attachments = draft[id];
    if (attachments) {
      const index = attachments.findIndex((a) => a.data.temporaryId === temporaryId);
      if (index !== -1) {
        attachments.splice(index, 1);
      }
    }
  }
}

const initialState: IAttachments<TemporaryAttachment> = {};

export const AttachmentsProvider = ({ children }: PropsWithChildren) => {
  const uploaded = useMappedAttachments();
  const [temporary, dispatch] = useImmerReducer(reducer, initialState);

  async function upload(action: AttachmentActionUpload) {
    const { node, file } = action;
    const temporaryId = uuidv4();
    dispatch({ ...action, temporaryId });
    const url = fileUploadUrl(node.item.baseComponentId || node.item.id);

    // PRIORITY: Reset validations for the whole component? That does not make sense, what if you upload multiple files?

    let contentType: string;
    if (!file.type) {
      contentType = `application/octet-stream`;
    } else if (file.name.toLowerCase().endsWith('.csv')) {
      contentType = 'text/csv';
    } else {
      contentType = file.type;
    }

    const config: AxiosRequestConfig = {
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `attachment; filename=${customEncodeURI(file.name)}`,
      },
    };

    try {
      await httpPost(url, config, file);
      dispatch({ action: 'remove', node, temporaryId });
      // PRIORITY: Add to instance data, causing mapping to occur
      // PRIORITY: Make sure to update the form data for nodes inside repeating groups
    } catch (error) {
      // PRIORITY: Handle error, register a validation error
      dispatch({ action: 'remove', node, temporaryId });
    }

    // PRIORITY: Return the proper ID of the attachment when it is uploaded
    // PRIORITY: See uploadAttachmentSaga and make sure this code re-implements everything needed
    return temporaryId;
  }

  async function update() {
    // PRIORITY: Implement. See updateAttachmentSaga
  }

  async function remove() {
    // PRIORITY: Implement. If the target component also has a data model binding, remove the data from the data model
    // as well. See deleteAttachmentSaga
  }

  const attachments = useMemo(() => mergeAndSort(temporary, uploaded), [temporary, uploaded]);
  tmpSagaAttachmentsData.current = attachments;

  return (
    <Provider
      value={{
        attachments,
        upload,
        update,
        remove,
      }}
    >
      {children}
    </Provider>
  );
};

function mergeAndSort(a: IAttachments, b: IAttachments) {
  const result: IAttachments = structuredClone(a);
  for (const nodeId in b) {
    const next = b[nodeId];
    const existing = result[nodeId];
    if (existing && next) {
      existing.push(...structuredClone(next));
    } else if (!existing && next) {
      result[nodeId] = structuredClone(b[nodeId]);
    }
  }

  // Sort all attachments by name
  for (const nodeId in result) {
    const attachments = result[nodeId];
    if (attachments) {
      attachments.sort(sortAttachmentsByName);
    }
  }

  return result;
}

function sortAttachmentsByName(a: IAttachment, b: IAttachment) {
  if (a.data.filename && b.data.filename) {
    return a.data.filename.localeCompare(b.data.filename);
  }
  return 0;
}

export const useAttachments = () => useCtx().attachments;
export const useAttachmentsUploader = () => useCtx().upload;
export const useAttachmentsFor = (node: LayoutNode<'FileUploadWithTag' | 'FileUpload'>) => {
  const { attachments } = useCtx();
  return attachments[node.item.id] || [];
};
