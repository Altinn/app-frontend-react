import React from 'react';

import { isAttachmentUploaded } from 'src/features/attachments';
import classes from 'src/layout/FileUpload/FileUploadTable/AttachmentThumbnail.module.css';
import { useThumbnailLink } from 'src/layout/FileUpload/FileUploadTable/useThumbnailLink';
import type { IAttachment } from 'src/features/attachments';

interface IAttachmentThumbnailProps {
  attachment: IAttachment;
  mobileView: boolean;
  onThumbnailClick?: () => void;
}

export const AttachmentThumbnail = ({ attachment, mobileView, onThumbnailClick }: IAttachmentThumbnailProps) => {
  const thumbnailUrl = useThumbnailLink(attachment);

  // Only uploaded attachments can have thumbnails
  if (!isAttachmentUploaded(attachment) || !thumbnailUrl) {
    return null;
  }

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
        src={thumbnailUrl}
        alt={`Thumbnail for ${attachment.data.filename}`}
        className={mobileView ? classes.thumbnailMobile : classes.thumbnail}
      />
    </div>
  );
};
