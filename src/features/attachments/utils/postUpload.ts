import { useEffect } from 'react';
import type React from 'react';

import { useImmerReducer } from 'use-immer';
import type { AxiosError } from 'axios';
import type { WritableDraft } from 'immer/dist/types/types-external';

import { useMappedAttachments } from 'src/features/attachments/utils/mapping';
import type {
  AttachmentActionRemove,
  AttachmentActionUpdate,
  IAttachments,
  RawAttachmentAction,
  UploadedAttachment,
} from 'src/features/attachments';
import type { SimpleAttachments } from 'src/features/attachments/utils/mapping';

type Update = AttachmentActionUpdate & { success: undefined };
type UpdateFulfilled = AttachmentActionUpdate & { success: true };
type UpdateRejected = AttachmentActionUpdate & { success: false; error: AxiosError };

type Remove = AttachmentActionRemove & { success: undefined };
type RemoveFulfilled = AttachmentActionRemove & { success: true };
type RemoveRejected = AttachmentActionRemove & { success: false; error: AxiosError };

type ActionReplaceAll = { action: 'replaceAll'; attachments: SimpleAttachments };

type Actions = Update | UpdateFulfilled | UpdateRejected | Remove | RemoveFulfilled | RemoveRejected | ActionReplaceAll;
type Dispatch = React.Dispatch<Actions>;

function postUploadedReducer(draft: WritableDraft<IAttachments<UploadedAttachment>>, action: Actions) {
  if (action.action === 'replaceAll') {
    const { attachments } = action;
    const out: IAttachments<UploadedAttachment> = {};

    for (const nodeId in attachments) {
      for (const attachment of attachments[nodeId]!) {
        out[nodeId] = out[nodeId] || [];
        out[nodeId]?.push({
          uploaded: true,
          updating: false,
          deleting: false,
          data: attachment,
        });
      }
    }

    return out;
  }
  if (action.action === 'update' && action.success === undefined) {
    const { tags, attachment, node } = action;

    const attachments = draft[node.item.id];
    if (attachments) {
      const index = attachments.findIndex((a) => a.data.id === attachment.data.id);
      if (index !== -1) {
        attachments[index].updating = true;
        attachments[index].data.tags = tags;
      }
    }
    return draft;
  }
  if (action.action === 'update' && action.success) {
    const { attachment, node } = action;

    const attachments = draft[node.item.id];
    if (attachments) {
      const index = attachments.findIndex((a) => a.data.id === attachment.data.id);
      if (index !== -1) {
        attachments[index].updating = false;
      }
    }
    return draft;
  }
  if (action.action === 'update' && !action.success) {
    const { attachment, node, error } = action;

    const attachments = draft[node.item.id];
    if (attachments) {
      const index = attachments.findIndex((a) => a.data.id === attachment.data.id);
      if (index !== -1) {
        attachments[index].updating = false;
        attachments[index].error = error;
      }
    }
    return draft;
  }
  if (action.action === 'delete' && action.success === undefined) {
    const { attachment, node } = action;

    const attachments = draft[node.item.id];
    if (attachments) {
      const index = attachments.findIndex((a) => a.data.id === attachment.data.id);
      if (index !== -1) {
        attachments[index].deleting = true;
      }
    }
    return draft;
  }
  if (action.action === 'delete' && action.success) {
    const { attachment, node } = action;

    const attachments = draft[node.item.id];
    if (attachments) {
      const index = attachments.findIndex((a) => a.data.id === attachment.data.id);
      if (index !== -1) {
        attachments.splice(index, 1);
      }
    }
    return draft;
  }
  if (action.action === 'delete' && !action.success) {
    const { attachment, node, error } = action;

    const attachments = draft[node.item.id];
    if (attachments) {
      const index = attachments.findIndex((a) => a.data.id === attachment.data.id);
      if (index !== -1) {
        attachments[index].deleting = false;
        attachments[index].error = error;
      }
    }
    return draft;
  }

  throw new Error('Invalid action');
}

const initialStatePostUpload: IAttachments<UploadedAttachment> = {};

export const usePostUpload = () => {
  const fromInstance = useMappedAttachments();

  const [state, dispatch] = useImmerReducer(postUploadedReducer, initialStatePostUpload);
  const update = useUpdate(dispatch);
  const remove = useRemove(dispatch);

  useEffect(() => {
    dispatch({ action: 'replaceAll', attachments: fromInstance });
  }, [dispatch, fromInstance]);

  return {
    state,
    update,
    remove,
  };
};

const useUpdate = (_dispatch: Dispatch) => async (_action: RawAttachmentAction<AttachmentActionUpdate>) => {
  // PRIORITY: Implement. See updateAttachmentSaga
};

const useRemove = (_dispatch: Dispatch) => async (_action: RawAttachmentAction<AttachmentActionRemove>) => {
  // PRIORITY: Implement. If the target component also has a data model binding, remove the data from the data model
  // as well. See deleteAttachmentSaga
};
