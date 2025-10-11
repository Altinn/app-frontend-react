import React, { useCallback, useRef, useState } from 'react';

import { ValidationMessage } from '@digdir/designsystemet-react';

import { AppCard } from 'src/app-components/Card/Card';
import { Lang } from 'src/features/language/Lang';
import { ImageCanvas } from 'src/layout/ImageUpload/ImageCanvas/ImageCanvas';
import { ImageControllers } from 'src/layout/ImageUpload/ImageControllers';
import { ImageDropzone } from 'src/layout/ImageUpload/ImageDropzone';
import {
  calculateMinZoom,
  calculatePositionForZoom,
  constrainToArea,
  cropAreaPlacement,
  drawCropArea,
  getNewFileName,
  IMAGE_TYPE,
  imagePlacement,
  validateFile,
} from 'src/layout/ImageUpload/imageUploadUtils';
import { useImageFile } from 'src/layout/ImageUpload/useImageFile';
import type { CropArea, Position } from 'src/layout/ImageUpload/imageUploadUtils';

interface ImageCropperProps {
  baseComponentId: string;
  cropArea: CropArea;
  readOnly: boolean;
}

const MAX_ZOOM = 5;

export function ImageCropper({ baseComponentId, cropArea, readOnly }: ImageCropperProps) {
  const { saveImage, deleteImage, storedImage } = useImageFile(baseComponentId);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);
  const imageTypeRef = useRef<string | null>(null);
  const [zoom, setZoom] = useState<number>(0);
  const [position, setPosition] = useState<Position>({ x: 0, y: 0 });
  const [validationErrors, setValidationErrors] = useState<string[] | null>(null);

  const minAllowedZoom = imageRef.current ? calculateMinZoom({ img: imageRef.current, cropArea }) : 0.1;

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

  const handleZoomChange = useCallback(
    (newZoomValue: number) => {
      const canvas = canvasRef.current;
      const img = imageRef.current;

      if (!canvas || !img) {
        return;
      }

      const newZoom = Math.max(minAllowedZoom, Math.min(newZoomValue, MAX_ZOOM));
      const newPosition = calculatePositionForZoom({ canvas, img, oldZoom: zoom, newZoom, position, cropArea });
      setZoom(newZoom);
      setPosition(newPosition);
    },
    [minAllowedZoom, position, zoom, cropArea],
  );

  const handleFileUpload = (file: File) => {
    const validationErrors = validateFile(file);
    setValidationErrors(validationErrors);
    if (validationErrors.length > 0) {
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result;

      if (typeof result === 'string') {
        const img = new Image();
        img.id = file.name;
        imageTypeRef.current = file.type;
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

      const newFileName = getNewFileName({ fileName: img.id });
      const imageFile = new File([blob], newFileName, { type: IMAGE_TYPE });
      saveImage(imageFile);
      setValidationErrors(null);
    }, IMAGE_TYPE);
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
    setZoom(minZoom);
    setPosition({ x: 0, y: 0 });
    imageRef.current = img;
  };

  if (!imageRef.current && !storedImage) {
    return (
      <>
        <ImageDropzone
          baseComponentId={baseComponentId}
          onDrop={(files) => handleFileUpload(files[0])}
          readOnly={!!readOnly}
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
          imageType={imageTypeRef.current!}
          readOnly={readOnly}
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
      key={`error-${index}`}
      data-size='sm'
    >
      <Lang id={error} />
    </ValidationMessage>
  ));
};
