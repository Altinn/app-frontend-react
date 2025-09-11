import React, { useCallback, useRef, useState } from 'react';

import { ValidationMessage } from '@digdir/designsystemet-react';

import { AppCard } from 'src/app-components/Card/Card';
import { Lang } from 'src/features/language/Lang';
import { useIsMobileOrTablet } from 'src/hooks/useDeviceWidths';
import { DropzoneComponent } from 'src/layout/FileUpload/DropZone/DropzoneComponent';
import { ImageCanvas } from 'src/layout/ImageUpload/ImageCanvas';
import { ImageControllers } from 'src/layout/ImageUpload/ImageControllers';
import classes from 'src/layout/ImageUpload/ImageUpload.module.css';
import {
  calculateMinZoom,
  constrainToArea,
  cropAreaPlacement,
  drawCropArea,
  imagePlacement,
} from 'src/layout/ImageUpload/imageUploadUtils';
import { useImageFile } from 'src/layout/ImageUpload/useImageFile';
import type { CropArea, Position } from 'src/layout/ImageUpload/imageUploadUtils';

interface ImageCropperProps {
  cropArea: CropArea;
  baseComponentId: string;
}

const MAX_ZOOM = 5;
const VALID_FILE_ENDINGS = ['.jpg', '.jpeg', '.png', '.gif'];

// ImageCropper Component
export function ImageCropper({ baseComponentId, cropArea }: ImageCropperProps) {
  const mobileView = useIsMobileOrTablet();
  const { saveImage, deleteImage, storedImage } = useImageFile(baseComponentId);

  // Refs for canvas and image
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);

  // State management
  const [zoom, setZoom] = useState<number>(1);
  const [position, setPosition] = useState<Position>({ x: 0, y: 0 });
  const [validationErrors, setValidationErrors] = useState<string[] | null>(null);

  const minAllowedZoom = imageRef.current ? calculateMinZoom({ img: imageRef.current, cropArea }) : 0.1;

  // Constrains position changes from the canvas component
  const handlePositionChange = useCallback(
    (newPosition: Position) => {
      if (!imageRef.current) {
        return;
      }
      setPosition(
        constrainToArea({
          image: imageRef.current,
          zoom,
          position: newPosition,
          cropArea,
        }),
      );
    },
    [zoom, cropArea],
  );

  // Constrains zoom changes from the canvas or controllers
  const handleZoomChange = useCallback(
    (newZoomValue: number) => {
      const newZoom = Math.max(minAllowedZoom, Math.min(newZoomValue, MAX_ZOOM));
      const canvas = canvasRef.current;
      const img = imageRef.current;

      if (!canvas || !img) {
        return;
      }

      const viewportCenterX = canvas.width / 2;
      const viewportCenterY = canvas.height / 2;

      const { imgX, imgY } = imagePlacement({ canvas, img, zoom, position });
      const imageCenterX = (viewportCenterX - imgX) / zoom;
      const imageCenterY = (viewportCenterY - imgY) / zoom;

      // Compute new position to keep the same image point under viewport center
      const newPosition = {
        x: viewportCenterX - imageCenterX * newZoom - (canvas.width - img.width * newZoom) / 2,
        y: viewportCenterY - imageCenterY * newZoom - (canvas.height - img.height * newZoom) / 2,
      };

      setZoom(newZoom);
      setPosition(
        constrainToArea({
          image: img,
          zoom: newZoom,
          position: newPosition,
          cropArea,
        }),
      );
    },
    [minAllowedZoom, cropArea, position, zoom],
  );

  const handleFileUpload = (file: File) => {
    const validationErrors: string[] = [];

    if (file.size > 10 * 1024 * 1024) {
      validationErrors.push('image_upload_component.error_file_size_exceeded');
    }
    if (!VALID_FILE_ENDINGS.some((ending) => file.name.toLowerCase().endsWith(ending))) {
      validationErrors.push('image_upload_component.error_invalid_file_type');
    }

    setValidationErrors(validationErrors);
    if (validationErrors.length > 0) {
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result;

      if (typeof result === 'string') {
        const img = new Image();
        img.onload = () => {
          imageRef.current = img;
          const newMinZoom = calculateMinZoom({ img, cropArea });
          setZoom(Math.max(1, newMinZoom));
          setPosition({ x: 0, y: 0 });
        };
        img.src = result;
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSave = () => {
    const canvas = canvasRef.current;
    const img = imageRef.current;
    const cropCanvas = document.createElement('canvas');
    const cropCtx = cropCanvas.getContext('2d');

    if (!canvas || !img || !cropCtx) {
      return;
    }

    cropCanvas.width = cropArea.width;
    cropCanvas.height = cropArea.height;

    const { imgX, imgY, scaledWidth, scaledHeight } = imagePlacement({ canvas, img, zoom, position });
    const { cropAreaX, cropAreaY } = cropAreaPlacement({ canvas, cropArea });

    drawCropArea({ ctx: cropCtx, cropArea });
    cropCtx.clip();
    cropCtx.drawImage(img, imgX - cropAreaX, imgY - cropAreaY, scaledWidth, scaledHeight);

    cropCanvas.toBlob((blob) => {
      if (!blob) {
        return;
      }
      const fileName = img?.name || 'cropped-image.png';
      const imageFile = new File([blob], fileName, { type: 'image/png' });
      saveImage(imageFile);
    }, 'image/png');
  };

  const handleReset = () => {
    setZoom(Math.max(1, minAllowedZoom));
    setPosition({ x: 0, y: 0 });
  };

  const handleDeleteImage = () => {
    deleteImage();
    imageRef.current = null;
    handleReset();
  };

  const handleCancel = () => {
    imageRef.current = null;
    setValidationErrors(null);
  };

  return (
    <AppCard
      variant='default'
      mediaPosition='top'
      className={classes.imageUploadCard}
      media={
        <ImageCanvas
          canvasRef={canvasRef}
          imageRef={imageRef}
          zoom={zoom}
          position={position}
          cropArea={cropArea}
          baseComponentId={baseComponentId}
          onPositionChange={handlePositionChange}
          onZoomChange={handleZoomChange}
        />
      }
    >
      {imageRef.current || storedImage ? (
        <ImageControllers
          zoom={zoom}
          zoomLimits={{ minZoom: minAllowedZoom, maxZoom: MAX_ZOOM }}
          storedImage={storedImage}
          updateZoom={handleZoomChange}
          onSave={handleSave}
          onDelete={handleDeleteImage}
          onCancel={handleCancel}
          onFileUploaded={handleFileUpload}
          onReset={handleReset}
        />
      ) : (
        <DropzoneComponent
          id='image-upload'
          isMobile={mobileView}
          readOnly={false}
          onClick={(e) => e.preventDefault()}
          onDrop={(files) => handleFileUpload(files[0])}
          hasValidationMessages={!!validationErrors && validationErrors?.length > 0}
          validFileEndings={VALID_FILE_ENDINGS}
          className={classes.dropZone}
          showUploadIcon={false}
        />
      )}
      {validationErrors && (
        <div className={classes.validationErrors}>
          {validationErrors.map((error, index) => (
            <ValidationMessage
              data-size='sm'
              key={index}
            >
              <Lang id={error} />
            </ValidationMessage>
          ))}
        </div>
      )}
    </AppCard>
  );
}
