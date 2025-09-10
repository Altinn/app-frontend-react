import { type UploadedAttachment } from 'src/features/attachments';
import { useAttachmentsFor, useAttachmentsRemover, useAttachmentsUploader } from 'src/features/attachments/hooks';
import { useIndexedId } from 'src/utils/layout/DataModelLocation';
import { useItemWhenType } from 'src/utils/layout/useNodeItem';

type ReturnType = {
  storedImage?: UploadedAttachment;
  saveImage: (file: File) => void;
  deleteImage: () => void;
};

export const useImageFile = (baseComponentId: string): ReturnType => {
  const { dataModelBindings } = useItemWhenType(baseComponentId, 'ImageUpload');
  const indexedId = useIndexedId(baseComponentId);
  const uploadImage = useAttachmentsUploader();
  const removeImage = useAttachmentsRemover();
  const storedImage = useAttachmentsFor(baseComponentId)[0] as UploadedAttachment | undefined;

  const saveImage = (file: File) => {
    uploadImage({
      files: [file],
      nodeId: indexedId,
      dataModelBindings,
    });
  };

  const deleteImage = () => {
    if (storedImage?.deleting) {
      return;
    }

    removeImage({
      attachment: storedImage as UploadedAttachment,
      nodeId: indexedId,
      dataModelBindings,
    });
  };

  return { storedImage, saveImage, deleteImage };
};
