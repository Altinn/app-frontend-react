import React, { useMemo } from 'react';
import type { PropsWithChildren } from 'react';

import { usePostUpload } from 'src/features/attachments/utils/postUpload';
import { usePreUpload } from 'src/features/attachments/utils/preUpload';
import { mergeAndSort } from 'src/features/attachments/utils/sorting';
import { createStrictContext } from 'src/utils/createContext';
import type { IAttachmentsCtx } from 'src/features/attachments/index';
import type { LayoutNode } from 'src/utils/layout/LayoutNode';

const { Provider, useCtx } = createStrictContext<IAttachmentsCtx>({ name: 'AttachmentsContext' });

export const AttachmentsProvider = ({ children }: PropsWithChildren) => {
  const { state: preUpload, upload, awaitUpload } = usePreUpload();
  const { state: postUpload, update, remove } = usePostUpload();

  const attachments = useMemo(() => mergeAndSort(preUpload, postUpload), [preUpload, postUpload]);
  window.lastKnownAttachments = attachments;

  return (
    <Provider
      value={{
        attachments,
        upload,
        update,
        remove,
        awaitUpload,
      }}
    >
      {children}
    </Provider>
  );
};

export const useAttachments = () => useCtx().attachments;
export const useAttachmentsUploader = () => useCtx().upload;
export const useAttachmentsUpdater = () => useCtx().update;
export const useAttachmentsRemover = () => useCtx().remove;
export const useAttachmentsAwaiter = () => useCtx().awaitUpload;
export const useAttachmentsFor = (node: LayoutNode<'FileUploadWithTag' | 'FileUpload'>) => {
  const { attachments } = useCtx();
  return attachments[node.item.id] || [];
};
