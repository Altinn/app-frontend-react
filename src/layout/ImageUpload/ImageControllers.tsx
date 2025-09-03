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

type ImageControllersProps = {
  zoom: number;
  logMin: number;
  logScale: number;
  updateZoom: (zoom: number) => void;
  onFileUploaded: (file: File) => void;
  onReset: () => void;
  onCrop: () => void;
};

export function ImageControllers({
  zoom,
  logMin,
  logScale,
  updateZoom,
  onFileUploaded,
  onReset,
  onCrop,
}: ImageControllersProps) {
  // Converts a linear slider value (0-100) to a logarithmic zoom value
  const sliderValueToZoom = (value: number) => Math.exp(logMin + logScale * value);
  // Converts a zoom value back to a linear slider value (0-100)
  const zoomToSliderValue = (zoomValue: number) => (Math.log(zoomValue) - logMin) / logScale;

  const handleSliderZoom = (e: React.ChangeEvent<HTMLInputElement>) => {
    const logarithmicZoomValue = sliderValueToZoom(parseFloat(e.target.value));
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
            value={zoomToSliderValue(zoom)}
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
