import React from 'react';

import { Spinner } from 'src/app-components/loading/Spinner/Spinner';
import classes from 'src/layout/FileUpload/FileUploadTable/AttachmentThumbnail.module.css';
import { useThumbnailLink } from 'src/layout/FileUpload/FileUploadTable/useThumbnailLink';
import type { IAttachment } from 'src/features/attachments';

interface ThumbnailPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  attachment: IAttachment;
  fileName: string;
  mobileView?: boolean;
}

export function ThumbnailPreviewModal({
  isOpen,
  onClose,
  attachment,
  fileName,
  mobileView,
}: ThumbnailPreviewModalProps): React.JSX.Element | null {
  const thumbnailUrl = useThumbnailLink(attachment);
  const [isImageLoading, setIsImageLoading] = React.useState(true);

  const handleImageLoad = () => {
    setIsImageLoading(false);
  };

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
        <div className={mobileView ? classes.previewHeaderMobile : classes.previewHeader}>
          <span className={classes.fileName}>{fileName}</span>
          <button
            className={classes.closeButton}
            onClick={onClose}
            aria-label='Close preview'
          >
            ×
          </button>
        </div>
        {isImageLoading && (
          <div className={classes.imageLoading}>
            <Spinner
              aria-label='Loading'
              data-size='md'
            />
          </div>
        )}
        <img
          src={thumbnailUrl}
          alt={fileName}
          className={mobileView ? classes.previewImageMobile : classes.previewImage}
          onLoad={handleImageLoad}
          style={{ display: isImageLoading ? 'none' : 'block' }}
        />
      </div>
    </div>
  );
}
