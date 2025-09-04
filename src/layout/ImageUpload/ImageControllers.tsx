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
import {
  calculatePositions,
  drawViewport,
  getViewport,
  logToNormalZoom,
  normalToLogZoom,
} from 'src/layout/ImageUpload/imageUploadUtils';
import { useIndexedId } from 'src/utils/layout/DataModelLocation';
import { useItemWhenType } from 'src/utils/layout/useNodeItem';
import type { ViewportType } from 'src/layout/ImageUpload/imageUploadUtils';

type ImageControllersProps = {
  zoom: number;
  zoomLimits: { minZoom: number; maxZoom: number };
  baseComponentId: string;
  refs: {
    canvasRef: React.RefObject<HTMLCanvasElement | null>;
    imageRef: React.RefObject<HTMLImageElement | null>;
  };
  position: { x: number; y: number };
  setImageSrc: (img: File | null) => void;
  updateZoom: (zoom: number) => void;
  onFileUploaded: (file: File) => void;
  onReset: () => void;
};

export function ImageControllers({
  zoom,
  zoomLimits: { minZoom, maxZoom },
  baseComponentId,
  refs: { canvasRef, imageRef },
  position,
  setImageSrc,
  updateZoom,
  onFileUploaded,
  onReset,
}: ImageControllersProps) {
  const indexedId = useIndexedId(baseComponentId);
  const { dataModelBindings, viewport } = useItemWhenType(baseComponentId, 'ImageUpload');
  const selectedViewport = getViewport(viewport as ViewportType);
  const uploadAttachment = useAttachmentsUploader();

  //bare midlertidig for å kunne laste resultatet som blir lagret i backend
  const [previewImage, setPreviewImage] = React.useState<string | null>(null);

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
    const canvas = canvasRef.current;
    const img = imageRef.current;
    const cropCanvas = document.createElement('canvas');
    const cropCtx = cropCanvas.getContext('2d');

    if (!canvas || !img || !cropCtx) {
      return;
    }

    cropCanvas.width = selectedViewport.width;
    cropCanvas.height = selectedViewport.height;

    const { imgX, imgY, scaledWidth, scaledHeight } = calculatePositions({ canvas, img, zoom, position });
    const viewportX = (canvas.width - selectedViewport.width) / 2;
    const viewportY = (canvas.height - selectedViewport.height) / 2;

    drawViewport({ ctx: cropCtx, selectedViewport });
    cropCtx.clip();
    cropCtx.drawImage(img, imgX - viewportX, imgY - viewportY, scaledWidth, scaledHeight);

    cropCanvas.toBlob((blob) => {
      if (!blob) {
        return;
      }

      const fileName = img?.name || 'cropped-image.png'; // fallback if img.name is deprecated
      const imageFile = new File([blob], fileName, { type: 'image/png' });

      // Use the file now
      uploadAttachment({
        files: [imageFile],
        nodeId: indexedId,
        dataModelBindings,
      });

      setPreviewImage(cropCanvas.toDataURL('image/png'));
    }, 'image/png');
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
        {/*fjern dette under senere*/}
        {previewImage && (
          <a
            href={previewImage}
            download='cropped-image.png'
          >
            Download Image
          </a>
        )}
      </div>
    </div>
  );
}
