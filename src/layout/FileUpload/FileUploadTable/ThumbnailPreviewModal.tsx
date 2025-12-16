import React from 'react';

import classes from 'src/layout/FileUpload/FileUploadTable/AttachmentThumbnail.module.css';
import { useThumbnailLink } from 'src/layout/FileUpload/FileUploadTable/useThumbnailLink';
import type { IAttachment } from 'src/features/attachments';

interface ThumbnailPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  attachment: IAttachment;
  fileName: string;
}

export function ThumbnailPreviewModal({
  isOpen,
  onClose,
  attachment,
  fileName,
}: ThumbnailPreviewModalProps): React.JSX.Element | null {
  const thumbnailUrl = useThumbnailLink(attachment);

  if (!isOpen) {
    return null;
  }

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className={classes.previewBackdrop}
      onClick={handleBackdropClick}
      onKeyDown={(e) => {
        if (e.key === 'Escape') {
          onClose();
        }
      }}
      role='button'
      tabIndex={0}
    >
      <div className={classes.previewModal}>
        <div className={classes.previewHeader}>
          <span className={classes.fileName}>{fileName}</span>
          <button
            className={classes.closeButton}
            onClick={onClose}
            aria-label='Close preview'
          >
            ×
          </button>
        </div>
        <img
          src={thumbnailUrl}
          alt={fileName}
          className={classes.previewImage}
        />
      </div>
    </div>
  );
}
