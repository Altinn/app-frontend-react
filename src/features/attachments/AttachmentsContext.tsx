import React from 'react';
import type { PropsWithChildren } from 'react';

import { useImmerReducer } from 'use-immer';

import { useMappedAttachments } from 'src/features/attachments/map/mapAttachments';
import { createStrictContext } from 'src/utils/createStrictContext';
import type { IAttachments, IAttachmentsCtx } from 'src/features/attachments/index';
import type { IUploadAttachmentAction } from 'src/features/attachments/upload/uploadAttachmentActions';
import type { LayoutNode } from 'src/utils/layout/LayoutNode';

const [Provider, useContext] = createStrictContext<IAttachmentsCtx>();

interface Storage {
  attachments: IAttachments;
}

interface ActionUpload {
  type: 'upload';
  payload: IUploadAttachmentAction;
}

type Actions = ActionUpload;

export const AttachmentsProvider = ({ children }: PropsWithChildren) => {
  const attachments = useMappedAttachments();
  const [state, dispatch] = useImmerReducer<Storage, Actions>((state, action) => {});

  return (
    <Provider
      value={{
        attachments,
        upload: (payload: IUploadAttachmentAction) => dispatch({ type: 'upload', payload }),
      }}
    >
      {children}
    </Provider>
  );
};

export const useAttachments = () => useContext().attachments;
export const useAttachmentsUploader = () => useContext().upload;
export const useAttachmentsFor = (node: LayoutNode<'FileUploadWithTag' | 'FileUpload'>) => {
  const { attachments } = useContext();
  return attachments[node.item.id] || [];
};
