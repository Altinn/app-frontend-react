import React from 'react';

import { Button, Input, Label } from '@digdir/designsystemet-react';
import {
  ArrowCirclepathReverseIcon as RefreshCw,
  ArrowsSquarepathIcon,
  ZoomMinusIcon as ZoomOut,
  ZoomPlusIcon as ZoomIn,
} from '@navikt/aksel-icons';

import { useAttachmentsUploader } from 'src/features/attachments/hooks';
import classes from 'src/layout/ImageUpload/ImageControllers.module.css';
import { logToNormalZoom, normalToLogZoom } from 'src/layout/ImageUpload/imageUploadUtils';
import { useIndexedId } from 'src/utils/layout/DataModelLocation';
import { useItemWhenType } from 'src/utils/layout/useNodeItem';

type ImageControllersProps = {
  zoom: number;
  zoomLimits: { minZoom: number; maxZoom: number };
  baseComponentId: string;
  imageSrc: File | null;
  setImageSrc: (img: File | null) => void;
  updateZoom: (zoom: number) => void;
  onFileUploaded: (file: File) => void;
  onReset: () => void;
  onCrop: () => void; // fjernes senere
};

export function ImageControllers({
  zoom,
  zoomLimits,
  baseComponentId,
  imageSrc,
  setImageSrc,
  updateZoom,
  onFileUploaded,
  onReset,
  // onCrop,
}: ImageControllersProps) {
  const indexedId = useIndexedId(baseComponentId);
  const { dataModelBindings } = useItemWhenType(baseComponentId, 'ImageUpload');
  const { minZoom, maxZoom } = zoomLimits;
  const uploadAttachment = useAttachmentsUploader();

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

  const handleSave = () => {
    if (imageSrc) {
      uploadAttachment({
        files: [imageSrc],
        nodeId: indexedId,
        dataModelBindings,
      });
    }
  };

  const handleCancel = () => {
    setImageSrc(null);
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
          onClick={handleSave}
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
          onClick={handleCancel}
          data-color='accent'
        >
          Avbryt
        </Button>
        {/* <button
          onClick={onCrop}
          className={`${classes.button} ${classes.cropButton}`}
        >
          Crop
        </button> */}
        {/* <Scissors className={styles.icon} /> */}
      </div>
    </div>
  );
}
