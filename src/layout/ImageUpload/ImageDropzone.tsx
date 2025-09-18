import React from 'react';

import cn from 'classnames';

import { Dropzone } from 'src/app-components/Dropzone/Dropzone';
import { Lang } from 'src/features/language/Lang';
import { useIsMobileOrTablet } from 'src/hooks/useDeviceWidths';
import classes from 'src/layout/ImageUpload/ImageDropzone.module.css';
import { VALID_FILE_ENDINGS } from 'src/layout/ImageUpload/imageUploadUtils';
import type { IDropzoneProps } from 'src/app-components/Dropzone/Dropzone';

// interface ImageDropzoneProps extends IDropzoneComponentProps {}
type ImageDropzoneProps = {
  componentId: string;
  hasErrors: boolean;
  readOnly: boolean;
  descriptionId?: string;
} & Pick<IDropzoneProps, 'onDrop'>;

export function ImageDropzone({ componentId, hasErrors, readOnly, descriptionId, onDrop }: ImageDropzoneProps) {
  const isMobile = useIsMobileOrTablet();
  const dragLabelId = `file-upload-drag-${componentId}`;
  const formatLabelId = `file-upload-format-${componentId}`;
  const ariaDescribedBy = [descriptionId, dragLabelId, formatLabelId].filter(Boolean).join(' ');

  const [dragActive, setDragActive] = React.useState(false);

  return (
    <Dropzone
      id={componentId}
      readOnly={readOnly}
      onDrop={onDrop}
      onDragActiveChange={setDragActive}
      hasValidationMessages={hasErrors}
      validFileEndings={VALID_FILE_ENDINGS}
      data-color='neutral'
      className={cn(classes.placeholder, { [classes.dragActive]: dragActive })}
      describedBy={ariaDescribedBy}
    >
      <div className={classes.dropZone}>
        <b id={dragLabelId}>
          {isMobile ? (
            <Lang id='form_filler.file_uploader_upload' />
          ) : (
            <>
              <Lang id='form_filler.file_uploader_drag' />
              <span className={classes.blueUnderLine}>
                {' '}
                <Lang id='form_filler.file_uploader_find' />
              </span>
            </>
          )}
        </b>
        <span id={formatLabelId}>
          <Lang id='image_upload_component.valid_file_types' />
        </span>
      </div>
    </Dropzone>
  );
}
