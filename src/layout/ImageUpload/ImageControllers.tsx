import React from 'react';

import { Button, Input, Label, Link } from '@digdir/designsystemet-react';
import { ArrowsSquarepathIcon, ArrowUndoIcon } from '@navikt/aksel-icons';

import classes from 'src/layout/ImageUpload/ImageControllers.module.css';
import { logToNormalZoom, normalToLogZoom } from 'src/layout/ImageUpload/imageUploadUtils';

type ImageControllersProps = {
  zoom: number;
  zoomLimits: { minZoom: number; maxZoom: number };
  storedImageLink?: string;
  onSave: () => void;
  onDelete: () => void;
  onCancel: () => void;
  updateZoom: (zoom: number) => void;
  onFileUploaded: (file: File) => void;
  onReset: () => void;
};

export function ImageControllers({
  zoom,
  zoomLimits: { minZoom, maxZoom },
  storedImageLink,
  onSave,
  onDelete,
  onCancel,
  updateZoom,
  onFileUploaded,
  onReset,
}: ImageControllersProps) {
  const handleSliderZoom = (e: React.ChangeEvent<HTMLInputElement>) => {
    const logarithmicZoomValue = normalToLogZoom({
      value: parseFloat(e.target.value),
      minZoom,
      maxZoom,
    });

    updateZoom(logarithmicZoomValue);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onFileUploaded(file);
    }
    e.target.value = '';
  };

  if (storedImageLink) {
    return (
      <div className={classes.actionButtons}>
        <Button
          data-size='sm'
          variant='secondary'
          data-color='accent'
          asChild
        >
          <Link href={storedImageLink}>Last ned bildet</Link>
        </Button>
        <Button
          data-size='sm'
          variant='secondary'
          data-color='danger'
          onClick={onDelete}
        >
          Slett bildet
        </Button>
      </div>
    );
  }

  return (
    <div className={classes.controlsContainer}>
      <div>
        <Label htmlFor='zoom'>Tilpass bildet</Label>
        <div className={classes.zoomControls}>
          <input
            id='zoom'
            type='range'
            min='0'
            max='100'
            step='0.5'
            value={logToNormalZoom({ value: zoom, minZoom, maxZoom })}
            onChange={handleSliderZoom}
            className={classes.zoomSlider}
          />
          <Button
            onClick={onReset}
            variant='tertiary'
            icon={true}
          >
            <ArrowUndoIcon className={classes.resetButton} />
          </Button>
        </div>
      </div>
      <div className={classes.actionButtons}>
        <Button
          onClick={onSave}
          data-size='sm'
          data-color='accent'
        >
          Lagre
        </Button>
        <Input
          id='image-upload'
          type='file'
          accept='image/*'
          onChange={handleImageChange}
          hidden
        />

        <Button
          asChild
          data-size='sm'
          variant='secondary'
          data-color='accent'
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              document.getElementById('image-upload')?.click();
            }
          }}
        >
          <Label htmlFor='image-upload'>
            <ArrowsSquarepathIcon />
            Bytt bilde
          </Label>
        </Button>
        <Button
          data-size='sm'
          variant='tertiary'
          onClick={onCancel}
          data-color='accent'
        >
          Avbryt
        </Button>
      </div>
    </div>
  );
}
