import React, { useCallback, useRef, useState } from 'react';

import { ValidationMessage } from '@digdir/designsystemet-react';

import { AppCard } from 'src/app-components/Card/Card';
import { getDescriptionId } from 'src/components/label/Label';
import { Lang } from 'src/features/language/Lang';
import { ImageCanvas } from 'src/layout/ImageUpload/ImageCanvas';
import { ImageControllers } from 'src/layout/ImageUpload/ImageControllers';
import { ImageDropzone } from 'src/layout/ImageUpload/ImageDropzone';
import {
  calculateMinZoom,
  constrainToArea,
  cropAreaPlacement,
  drawCropArea,
  imagePlacement,
  VALID_FILE_ENDINGS,
  validateFile,
} from 'src/layout/ImageUpload/imageUploadUtils';
import { useImageFile } from 'src/layout/ImageUpload/useImageFile';
import type { CropArea, Position } from 'src/layout/ImageUpload/imageUploadUtils';

interface ImageCropperProps {
  cropArea: CropArea;
  baseComponentId: string;
}

const MAX_ZOOM = 5;

// ImageCropper Component
export function ImageCropper({ baseComponentId, cropArea }: ImageCropperProps) {
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
    const validationErrors = validateFile({ file, validFileEndings: VALID_FILE_ENDINGS });
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
          updateImageState({ minZoom: calculateMinZoom({ img, cropArea }), img });
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

  const handleDeleteImage = () => {
    deleteImage();
    updateImageState({ img: null });
  };

  const handleCancel = () => {
    setValidationErrors(null);
    updateImageState({ img: null });
  };

  type UpdateImageState = { minZoom?: number; img?: HTMLImageElement | null };
  const updateImageState = ({ minZoom = minAllowedZoom, img = imageRef.current }: UpdateImageState) => {
    setZoom(Math.max(1, minZoom));
    setPosition({ x: 0, y: 0 });
    imageRef.current = img;
  };

  if (!imageRef.current && !storedImage) {
    return (
      <>
        <ImageDropzone
          componentId={baseComponentId}
          descriptionId={getDescriptionId(baseComponentId)}
          onDrop={(files) => handleFileUpload(files[0])}
          readOnly={false}
          hasErrors={!!validationErrors && validationErrors?.length > 0}
        />
        <ValidationMessages validationErrors={validationErrors} />
      </>
    );
  }

  return (
    <AppCard
      variant='default'
      mediaPosition='top'
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
      {(imageRef.current || storedImage) && (
        <ImageControllers
          zoom={zoom}
          zoomLimits={{ minZoom: minAllowedZoom, maxZoom: MAX_ZOOM }}
          storedImage={storedImage}
          updateZoom={handleZoomChange}
          onSave={handleSave}
          onDelete={handleDeleteImage}
          onCancel={handleCancel}
          onFileUploaded={handleFileUpload}
          onReset={() => updateImageState({})}
        />
      )}
      <ValidationMessages validationErrors={validationErrors} />
    </AppCard>
  );
}

const ValidationMessages = ({ validationErrors }: { validationErrors: string[] | null }) => {
  if (!validationErrors) {
    return null;
  }

  return validationErrors.map((error, index) => (
    <ValidationMessage
      data-size='sm'
      key={index}
    >
      <Lang id={error} />
    </ValidationMessage>
  ));
};
