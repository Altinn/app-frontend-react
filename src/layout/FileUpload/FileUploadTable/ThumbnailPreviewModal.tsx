import React from 'react';

import { Spinner } from 'src/app-components/loading/Spinner/Spinner';
import { type IAttachment, isAttachmentUploaded } from 'src/features/attachments';
import { useLaxInstanceId } from 'src/features/instance/InstanceContext';
import { useCurrentLanguage } from 'src/features/language/LanguageProvider';
import classes from 'src/layout/FileUpload/FileUploadTable/AttachmentThumbnail.module.css';
import { getDataElementUrl } from 'src/utils/urls/appUrlHelper';
import { makeUrlRelativeIfSameDomain } from 'src/utils/urls/urlHelper';

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
  const language = useCurrentLanguage();
  const instanceId = useLaxInstanceId();
  const [isImageLoading, setIsImageLoading] = React.useState(true);
  const url =
    isAttachmentUploaded(attachment) && instanceId
      ? makeUrlRelativeIfSameDomain(getDataElementUrl(instanceId, attachment.data.id, language))
      : undefined;

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
          src={url}
          alt={fileName}
          className={mobileView ? classes.previewImageMobile : classes.previewImage}
          onLoad={handleImageLoad}
          style={{ display: isImageLoading ? 'none' : 'block' }}
        />
      </div>
    </div>
  );
}
