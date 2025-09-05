import { useAttachmentsFor, useAttachmentsRemover, useAttachmentsUploader } from 'src/features/attachments/hooks';
import { useLaxInstanceId } from 'src/features/instance/InstanceContext';
import { useCurrentLanguage } from 'src/features/language/LanguageProvider';
import { useIndexedId } from 'src/utils/layout/DataModelLocation';
import { useItemWhenType } from 'src/utils/layout/useNodeItem';
import { getDataElementUrl } from 'src/utils/urls/appUrlHelper';
import { makeUrlRelativeIfSameDomain } from 'src/utils/urls/urlHelper';
import type { UploadedAttachment } from 'src/features/attachments';

type ReturnType = {
  storedImageLink: string | undefined;
  saveImage: (file: File) => void;
  deleteImage: () => void;
};

export const useImageFile = (baseComponentId: string): ReturnType => {
  const { dataModelBindings } = useItemWhenType(baseComponentId, 'ImageUpload');
  const indexedId = useIndexedId(baseComponentId);
  const uploadImage = useAttachmentsUploader();
  const removeImage = useAttachmentsRemover();
  const storedImage = useAttachmentsFor(baseComponentId)[0] as UploadedAttachment | undefined;
  const language = useCurrentLanguage();
  const instanceId = useLaxInstanceId();

  const storedImageLink =
    storedImage &&
    instanceId &&
    makeUrlRelativeIfSameDomain(getDataElementUrl(instanceId, storedImage.data.id, language));

  const saveImage = (file: File) => {
    uploadImage({
      files: [file],
      nodeId: indexedId,
      dataModelBindings,
    });
  };

  const deleteImage = () => {
    if (!storedImage?.uploaded) {
      return;
    }

    removeImage({
      attachment: storedImage,
      nodeId: indexedId,
      dataModelBindings,
    });
  };

  return { storedImageLink, saveImage, deleteImage };
};
