import React from 'react';

import { useIsMobileOrTablet } from 'src/hooks/useDeviceWidths';
import { DropzoneComponent } from 'src/layout/FileUpload/DropZone/DropzoneComponent';
import classes from 'src/layout/ImageUpload/ImageDropzone.module.css';
import { VALID_FILE_ENDINGS } from 'src/layout/ImageUpload/imageUploadUtils';
import type { IDropzoneComponentProps } from 'src/layout/FileUpload/DropZone/DropzoneComponent';

// interface ImageDropzoneProps extends IDropzoneComponentProps {}
type ImageDropzoneProps = {
  hasErrors: boolean;
  readOnly: boolean;
} & Pick<IDropzoneComponentProps, 'onDrop'>;

export function ImageDropzone({ hasErrors, readOnly, onDrop }: ImageDropzoneProps) {
  const mobileView = useIsMobileOrTablet();

  return (
    <div className={classes.placeholder}>
      <DropzoneComponent
        id='image-upload'
        isMobile={mobileView}
        readOnly={readOnly}
        onClick={(e) => e.preventDefault()}
        onDrop={onDrop}
        hasValidationMessages={hasErrors}
        validFileEndings={VALID_FILE_ENDINGS}
        className={classes.dropZone}
        showUploadIcon={false}
      />
    </div>
  );
}
