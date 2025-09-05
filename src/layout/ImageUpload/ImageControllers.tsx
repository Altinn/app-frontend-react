import React from 'react';

import { Button, Input, Label } from '@digdir/designsystemet-react';
import {
  ArrowCirclepathReverseIcon as RefreshCw,
  ArrowsSquarepathIcon,
  ZoomMinusIcon as ZoomOut,
  ZoomPlusIcon as ZoomIn,
} from '@navikt/aksel-icons';

import classes from 'src/layout/ImageUpload/ImageControllers.module.css';
import { logToNormalZoom, normalToLogZoom } from 'src/layout/ImageUpload/imageUploadUtils';

type ImageControllersProps = {
  zoom: number;
  zoomLimits: { minZoom: number; maxZoom: number };
  onSave: () => void;
  onCancel: () => void;
  updateZoom: (zoom: number) => void;
  onFileUploaded: (file: File) => void;
  onReset: () => void;
};

export function ImageControllers({
  zoom,
  zoomLimits: { minZoom, maxZoom },
  onSave,
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

  return (
    <div className={classes.controlsContainer}>
      <div className={classes.controlSection}>
        <label
          htmlFor='zoom'
          className={classes.label}
        >
          Zoom
        </label>
        <div className={classes.zoomControls}>
          <ZoomOut className={classes.zoomIcon} />
          <input
            id='zoom'
            type='range'
            min='0'
            max='100'
            step='0.1'
            value={logToNormalZoom({ value: zoom, minZoom, maxZoom })}
            onChange={handleSliderZoom}
            className={classes.zoomSlider}
          />
          <ZoomIn className={classes.zoomIcon} />
          <Button
            data-size='sm'
            onClick={onReset}
            className={`${classes.button} ${classes.resetButton}`}
          >
            <RefreshCw className={classes.icon} /> Reset
          </Button>
        </div>
      </div>
      <div className={classes.actionButtons}>
        <Button
          onClick={onSave}
          data-size='sm'
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
        >
          <Label
            htmlFor='image-upload'
            className={classes.changeImageLabel}
          >
            <ArrowsSquarepathIcon />
            Bytt bilde
          </Label>
        </Button>
        <Button
          data-size='sm'
          variant='secondary'
          onClick={onCancel}
          data-color='accent'
        >
          Avbryt
        </Button>
      </div>
    </div>
  );
}
