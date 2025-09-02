import React from 'react';

import { Button, Input, Label } from '@digdir/designsystemet-react';
import { ArrowsSquarepathIcon } from '@navikt/aksel-icons';

import { useIsMobileOrTablet } from 'src/hooks/useDeviceWidths';
import { DropzoneComponent } from 'src/layout/FileUpload/DropZone/DropzoneComponent';
import styles from 'src/layout/ImageUpload/ImageUploadButton.module.css';

type ImageUploadButtonProps = {
  imgSrc: string | null;
  setImgSrc: (src: string | null) => void;
  onFileUploaded: (img: HTMLImageElement, dataUrl: string) => void;
};

export function ImageUploadButton({ imgSrc, onFileUploaded }: ImageUploadButtonProps) {
  const mobileView = useIsMobileOrTablet();

  const handleFileUpload = (file: File) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result;

      if (typeof result === 'string') {
        const img = new Image();
        img.onload = () => onFileUploaded(img, result);
        img.src = result;
      }
    };
    reader.readAsDataURL(file);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  if (imgSrc) {
    return (
      <>
        <Input
          id='image-upload'
          type='file'
          accept='image/*'
          onChange={handleInputChange}
          hidden
        />

        <Button
          asChild
          data-size='sm'
          variant='secondary'
          data-color='neutral'
        >
          <Label
            htmlFor='image-upload'
            className={styles.changeImageLabel}
          >
            <ArrowsSquarepathIcon />
            Bytt bilde
          </Label>
        </Button>
      </>
    );
  }

  return (
    <div className={styles.dropZoneWrapper}>
      <DropzoneComponent
        id='image-upload'
        isMobile={mobileView}
        maxFileSizeInMB={10}
        readOnly={false}
        onClick={(e) => e.preventDefault()}
        onDrop={(files) => handleFileUpload(files[0])}
        hasValidationMessages={false}
        // validFileEndings={['.jpg', '.jpeg', '.png', '.gif']} //her skal vi oppgi en liste i konfigen?'
      />
    </div>
  );
}
