import React from 'react';

import { isAttachmentUploaded } from 'src/features/attachments';
import { useInstanceDataElements, useLaxInstanceId } from 'src/features/instance/InstanceContext';
import { useCurrentLanguage } from 'src/features/language/LanguageProvider';
import classes from 'src/layout/FileUpload/FileUploadTable/AttachmentThumbnail.module.css';
import { getDataElementUrl } from 'src/utils/urls/appUrlHelper';
import { makeUrlRelativeIfSameDomain } from 'src/utils/urls/urlHelper';
import type { IAttachment } from 'src/features/attachments';

interface IAttachmentThumbnailProps {
  attachment: IAttachment;
  mobileView: boolean;
  onThumbnailClick?: () => void;
}

export const AttachmentThumbnail = ({ attachment, mobileView, onThumbnailClick }: IAttachmentThumbnailProps) => {
  const dataElements = useInstanceDataElements(undefined);
  const instanceId = useLaxInstanceId();
  const language = useCurrentLanguage();

  // Only uploaded attachments can have thumbnails
  if (!instanceId || !isAttachmentUploaded(attachment)) {
    return '';
  }

  const thumbnailLink = attachment.data.metadata?.find((meta) => meta.key === 'thumbnailLink')?.value;
  if (!thumbnailLink) {
    return '';
  }

  const thumbnailDataElement = dataElements.find(
    (el) =>
      el.dataType === 'thumbnail' &&
      el.metadata?.some((meta) => meta.key === 'attachmentLink' && meta.value === thumbnailLink),
  );

  const url = thumbnailDataElement
    ? makeUrlRelativeIfSameDomain(getDataElementUrl(instanceId, thumbnailDataElement.id, language))
    : undefined;

  return (
    <div
      className={classes.thumbnailContainer}
      data-testid='attachment-thumbnail'
      onClick={onThumbnailClick}
      style={onThumbnailClick ? { cursor: 'pointer' } : {}}
      role={onThumbnailClick ? 'button' : undefined}
      tabIndex={onThumbnailClick ? 0 : undefined}
      onKeyDown={onThumbnailClick ? (e) => e.key === 'Enter' && onThumbnailClick() : undefined}
    >
      <img
        src={url}
        alt={`Thumbnail for ${attachment.data.filename}`}
        className={mobileView ? classes.thumbnailMobile : classes.thumbnail}
      />
    </div>
  );
};
