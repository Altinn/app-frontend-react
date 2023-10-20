import React, { useMemo } from 'react';
import type { PropsWithChildren } from 'react';

import { usePostUpload } from 'src/features/attachments/utils/postUpload';
import { usePreUpload } from 'src/features/attachments/utils/preUpload';
import { mergeAndSort } from 'src/features/attachments/utils/sorting';
import { createStrictContext } from 'src/utils/createContext';
import type { IAttachments, IAttachmentsCtx } from 'src/features/attachments/index';
import type { LayoutNode } from 'src/utils/layout/LayoutNode';

// TODO: Remove this when no sagas, etc, are using it
export const tmpSagaAttachmentsData: { current: IAttachments | null } = { current: null };

const { Provider, useCtx } = createStrictContext<IAttachmentsCtx>();

export const AttachmentsProvider = ({ children }: PropsWithChildren) => {
  const { state: preUpload, upload } = usePreUpload();
  const { state: postUpload, update, remove } = usePostUpload();

  const attachments = useMemo(() => mergeAndSort(preUpload, postUpload), [preUpload, postUpload]);
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

export const useAttachments = () => useCtx().attachments;
export const useAttachmentsUploader = () => useCtx().upload;
export const useAttachmentsUpdater = () => useCtx().update;
export const useAttachmentsRemover = () => useCtx().remove;
export const useAttachmentsFor = (node: LayoutNode<'FileUploadWithTag' | 'FileUpload'>) => {
  const { attachments } = useCtx();
  return attachments[node.item.id] || [];
};
