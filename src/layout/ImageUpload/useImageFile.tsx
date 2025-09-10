import { type UploadedAttachment } from 'src/features/attachments';
import { useAttachmentsFor, useAttachmentsRemover, useAttachmentsUploader } from 'src/features/attachments/hooks';
import { useLaxInstanceId } from 'src/features/instance/InstanceContext';
import { useCurrentLanguage } from 'src/features/language/LanguageProvider';
import { useIndexedId } from 'src/utils/layout/DataModelLocation';
import { useItemWhenType } from 'src/utils/layout/useNodeItem';
import { getDataElementUrl } from 'src/utils/urls/appUrlHelper';
import { makeUrlRelativeIfSameDomain } from 'src/utils/urls/urlHelper';

export type ImageLinkState =
  | { status: 'none' }
  | { status: 'uploading' }
  | { status: 'ready'; storedImageLink: string };

type ReturnType = {
  imageLink: ImageLinkState;
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

  let imageLink: ImageLinkState = { status: 'none' };
  if (storedImage) {
    if (storedImage.uploaded && instanceId) {
      const url = makeUrlRelativeIfSameDomain(getDataElementUrl(instanceId, storedImage.data.id, language));
      imageLink = { status: 'ready', storedImageLink: url };
    } else {
      imageLink = { status: 'uploading' };
    }
  }

  // const imageLink: ImageLinkState = storedImage
  //   ? {
  //       status: storedImage.uploaded ? 'ready' : 'uploading',
  //       storedImageLink:
  //         storedImage.uploaded && instanceId
  //           ? makeUrlRelativeIfSameDomain(getDataElementUrl(instanceId, storedImage.data.id, language))
  //           : undefined,
  //     }
  //   : { status: 'none' };

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

  return { imageLink, saveImage, deleteImage };
};
