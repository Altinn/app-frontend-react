import React from 'react';

import { Button, Input, Label } from '@digdir/designsystemet-react';
import {
  ArrowCirclepathReverseIcon as RefreshCw,
  ArrowsSquarepathIcon,
  ScissorsFillIcon as Scissors,
  ZoomMinusIcon as ZoomOut,
  ZoomPlusIcon as ZoomIn,
} from '@navikt/aksel-icons';

import styles from 'src/layout/ImageUpload/ImageControllers.module.css';
import { logToNormalZoom, normalToLogZoom } from 'src/layout/ImageUpload/imageUploadUtils';

type ImageControllersProps = {
  zoom: number;
  zoomLimits: { minZoom: number; maxZoom: number };
  updateZoom: (zoom: number) => void;
  onFileUploaded: (file: File) => void;
  onReset: () => void;
  onCrop: () => void;
};

export function ImageControllers({
  zoom,
  zoomLimits,
  updateZoom,
  onFileUploaded,
  onReset,
  onCrop,
}: ImageControllersProps) {
  const { minZoom, maxZoom } = zoomLimits;

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
  };

  return (
    <div className={styles.controlsContainer}>
      <div className={styles.controlSection}>
        <label
          htmlFor='zoom'
          className={styles.label}
        >
          Zoom
        </label>
        <div className={styles.zoomControls}>
          <ZoomOut className={styles.zoomIcon} />
          <input
            id='zoom'
            type='range'
            min='0'
            max='100'
            step='0.1'
            // value={zoomToSliderValue(zoom)}
            value={logToNormalZoom({ value: zoom, minZoom, maxZoom })}
            onChange={handleSliderZoom}
            className={styles.zoomSlider}
          />
          <ZoomIn className={styles.zoomIcon} />
        </div>
      </div>
      <div className={styles.actionButtons}>
        <button
          onClick={onReset}
          className={`${styles.button} ${styles.resetButton}`}
        >
          <RefreshCw className={styles.icon} /> Reset
        </button>
        <button
          onClick={onCrop}
          className={`${styles.button} ${styles.cropButton}`}
        >
          <Scissors className={styles.icon} /> Crop
        </button>
      </div>

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
    </div>
  );
}
