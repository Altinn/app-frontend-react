import React, { useCallback, useMemo, useRef, useState } from 'react';

import { AppCard } from 'src/app-components/Card/Card';
import { useIsMobileOrTablet } from 'src/hooks/useDeviceWidths';
import { DropzoneComponent } from 'src/layout/FileUpload/DropZone/DropzoneComponent';
import { ImageCanvas } from 'src/layout/ImageUpload/ImageCanvas';
import { ImageControllers } from 'src/layout/ImageUpload/ImageControllers';
import classes from 'src/layout/ImageUpload/ImageUpload.module.css';
import { calculatePositions, constrainToArea, drawCropArea } from 'src/layout/ImageUpload/imageUploadUtils';
import { useImageFile } from 'src/layout/ImageUpload/useImageFile';
import type { CropArea, Position } from 'src/layout/ImageUpload/imageUploadUtils';

interface ImageCropperProps {
  cropArea: CropArea;
  baseComponentId: string;
}

const MAX_ZOOM = 5;

// ImageCropper Component
export function ImageCropper({ baseComponentId, cropArea }: ImageCropperProps) {
  const mobileView = useIsMobileOrTablet();
  const { saveImage, deleteImage, storedImageLink } = useImageFile(baseComponentId);

  // Refs for canvas and image
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);

  // State management
  const [zoom, setZoom] = useState<number>(1);
  const [position, setPosition] = useState<Position>({ x: 0, y: 0 });
  const [imageSrc, setImageSrc] = useState<File | null>(null);

  const minAllowedZoom = useMemo(() => {
    if (!imageRef.current) {
      return 0.1;
    }
    return Math.max(cropArea.width / imageRef.current.width, cropArea.height / imageRef.current.height);
  }, [cropArea]);

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

      // Image coordinates currently under viewport center
      const imageCenterX = (viewportCenterX - position.x - (canvas.width - img.width * zoom) / 2) / zoom;
      const imageCenterY = (viewportCenterY - position.y - (canvas.height - img.height * zoom) / 2) / zoom;

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
    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result;

      if (typeof result === 'string') {
        const img = new Image();
        img.onload = () => {
          imageRef.current = img;
          const newMinZoom = Math.max(cropArea.width / img.width, cropArea.height / img.height);
          setZoom(Math.max(1, newMinZoom));
          setPosition({ x: 0, y: 0 });
          setImageSrc(file);
        };
        img.src = result;
      }
    };
    reader.readAsDataURL(file);
  };

  const handleReset = () => {
    setZoom(Math.max(1, minAllowedZoom));
    setPosition({ x: 0, y: 0 });
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

    const { imgX, imgY, scaledWidth, scaledHeight } = calculatePositions({ canvas, img, zoom, position });
    const cropAreaX = (canvas.width - cropArea.width) / 2;
    const cropAreaY = (canvas.height - cropArea.height) / 2;

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
    imageRef.current = null;
    setImageSrc(null);
    handleReset();
  };

  return (
    <AppCard
      variant='default'
      mediaPosition='top'
      className={classes.imageUploadCard}
      media={
        imageSrc ? (
          <ImageCanvas
            canvasRef={canvasRef}
            imageRef={imageRef}
            zoom={zoom}
            position={position}
            cropArea={cropArea}
            onPositionChange={handlePositionChange}
            onZoomChange={handleZoomChange}
          />
        ) : (
          <div className={classes.placeholder} />
        )
      }
    >
      {imageSrc || storedImageLink ? (
        <ImageControllers
          zoom={zoom}
          zoomLimits={{ minZoom: minAllowedZoom, maxZoom: MAX_ZOOM }}
          storedImageLink={storedImageLink}
          updateZoom={handleZoomChange}
          onSave={handleSave}
          onDelete={handleDeleteImage}
          onCancel={() => setImageSrc(null)}
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
          hasValidationMessages={false}
          validFileEndings={['.jpg', '.jpeg', '.png', '.gif']}
          className={classes.dropZone}
          showUploadIcon={false}
        />
      )}
    </AppCard>
  );
}
