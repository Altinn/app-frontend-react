import React from 'react';

import { isAttachmentUploaded } from 'src/features/attachments';
import { useInstanceDataElements, useLaxInstanceId } from 'src/features/instance/InstanceContext';
import { useCurrentLanguage } from 'src/features/language/LanguageProvider';
import classes from 'src/layout/FileUpload/FileUploadTable/AttachmentThumbnail.module.css';
import { getDataElementUrl } from 'src/utils/urls/appUrlHelper';
import { makeUrlRelativeIfSameDomain } from 'src/utils/urls/urlHelper';
import type { IAttachment, UploadedAttachment } from 'src/features/attachments';
interface IAttachmentThumbnailProps {
  attachment: IAttachment;
  mobileView: boolean;
}

export const AttachmentThumbnail = ({ attachment, mobileView }: IAttachmentThumbnailProps) => {
  // Get all data elements from the instance
  const dataElements = useInstanceDataElements(undefined);
  const instanceId = useLaxInstanceId();
  const language = useCurrentLanguage();

  // Only uploaded attachments can have thumbnails
  if (!isAttachmentUploaded(attachment)) {
    return null;
  }

  //Check for thumbnail metadata in the attachment
  const thumbnailLink =
    (attachment as UploadedAttachment)?.data?.metadata?.find(
      (meta: { key: string; value: string }) => meta.key === 'thumbnailLink',
    )?.value ?? null;

  if (!thumbnailLink) {
    return null;
  }

  // Find the thumbnail data element
  const thumbnailDataElement = dataElements.find(
    (el) =>
      el.dataType === 'thumbnail' &&
      el.metadata?.some((meta) => meta.key === 'attachmentLink' && meta.value === thumbnailLink),
  );

  if (!thumbnailDataElement?.id || !instanceId) {
    return null;
  }

  const thumbnailUrl = makeUrlRelativeIfSameDomain(getDataElementUrl(instanceId, thumbnailDataElement.id, language));

  if (!thumbnailUrl) {
    return null;
  }

  return (
    <div
      className={classes.thumbnailContainer}
      data-testid='attachment-thumbnail'
    >
      <img
        src={thumbnailUrl}
        alt={`Thumbnail for ${attachment.data.filename}`}
        className={mobileView ? classes.thumbnailMobile : classes.thumbnail}
      />
    </div>
  );
};
