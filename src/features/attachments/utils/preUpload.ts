import type React from 'react';

import { useMutation } from '@tanstack/react-query';
import { useImmerReducer } from 'use-immer';
import { v4 as uuidv4 } from 'uuid';
import type { UseMutationOptions } from '@tanstack/react-query';
import type { WritableDraft } from 'immer/dist/types/types-external';

import { useAppMutations } from 'src/contexts/appQueriesContext';
import { useLaxInstance } from 'src/features/instance/InstanceContext';
import type {
  AttachmentActionUpload,
  IAttachment,
  IAttachments,
  RawAttachmentAction,
  TemporaryAttachment,
} from 'src/features/attachments';
import type { IData } from 'src/types/shared';
import type { LayoutNode } from 'src/utils/layout/LayoutNode';
import type { HttpClientError } from 'src/utils/network/sharedNetworking';

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
export const useUpload = (dispatch: Dispatch) => {
  const { changeData: changeInstanceData } = useLaxInstance() || {};
  const { mutateAsync } = useAttachmentsUploadMutation();

  return async (action: RawAttachmentAction<AttachmentActionUpload>) => {
    const { node, file } = action;
    const temporaryId = uuidv4();
    dispatch({ ...action, temporaryId, action: 'upload' });

    // PRIORITY: Reset validations for the whole component? That does not make sense, what if you upload multiple files?

    try {
      const reply = await mutateAsync({
        dataTypeId: node.item.baseComponentId || node.item.id,
        file,
      });
      if (!reply || !reply.blobStoragePath) {
        throw new Error('Failed to upload attachment');
      }

      dispatch({ action: 'remove', node, temporaryId });
      changeInstanceData &&
        changeInstanceData((instance) => {
          if (instance?.data && reply) {
            return {
              ...instance,
              data: [...instance.data, reply],
            };
          }

          return instance;
        });

      return reply.id;
    } catch (error) {
      // PRIORITY: Handle error, register a validation error
      dispatch({ action: 'remove', node, temporaryId });
    }

    // PRIORITY: See uploadAttachmentSaga and make sure this code re-implements everything needed
    return undefined;
  };
};

interface MutationVariables {
  dataTypeId: string;
  file: File;
}

function useAttachmentsUploadMutation() {
  const { doAttachmentUpload } = useAppMutations();

  const options: UseMutationOptions<IData, HttpClientError, MutationVariables> = {
    mutationFn: ({ dataTypeId, file }: MutationVariables) => doAttachmentUpload.call(dataTypeId, file),
    onError: (error: HttpClientError) => {
      window.logError('Failed to upload attachment:\n', error.message);
    },
  };

  return useMutation(options);
}
