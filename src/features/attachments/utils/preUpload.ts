import type React from 'react';

import { useImmerReducer } from 'use-immer';
import { v4 as uuidv4 } from 'uuid';
import type { AxiosRequestConfig } from 'axios';
import type { WritableDraft } from 'immer/dist/types/types-external';

import { httpPost } from 'src/utils/network/networking';
import { fileUploadUrl } from 'src/utils/urls/appUrlHelper';
import { customEncodeURI } from 'src/utils/urls/urlHelper';
import type {
  AttachmentActionUpload,
  IAttachment,
  IAttachments,
  RawAttachmentAction,
  TemporaryAttachment,
} from 'src/features/attachments';
import type { LayoutNode } from 'src/utils/layout/LayoutNode';

interface ActionUpload extends AttachmentActionUpload {
  temporaryId: string;
}

interface ActionRemove {
  action: 'remove';
  node: LayoutNode<'FileUploadWithTag' | 'FileUpload'>;
  temporaryId: string;
}

type Actions = ActionUpload | ActionRemove;

function reducer(draft: WritableDraft<IAttachments<TemporaryAttachment>>, action: Actions) {
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

type Dispatch = React.Dispatch<Actions>;
const initialState: IAttachments<TemporaryAttachment> = {};
export const usePreUpload = () => {
  const [state, dispatch] = useImmerReducer(reducer, initialState);
  const upload = useUpload(dispatch);

  return { state, upload };
};

/**
 * Do not use this directly, use the `useAttachmentsUploader` hook instead.
 * @see useAttachmentsUploader
 */
export const useUpload = (dispatch: Dispatch) => async (action: RawAttachmentAction<AttachmentActionUpload>) => {
  const { node, file } = action;
  const temporaryId = uuidv4();
  dispatch({ ...action, temporaryId, action: 'upload' });
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
};
