import React, { useCallback, useMemo, useRef, useState } from 'react';

import { AppCard } from 'src/app-components/Card/Card';
import { useIsMobileOrTablet } from 'src/hooks/useDeviceWidths';
import { DropzoneComponent } from 'src/layout/FileUpload/DropZone/DropzoneComponent';
import { ImageCanvas } from 'src/layout/ImageUpload/ImageCanvas';
import { ImageControllers } from 'src/layout/ImageUpload/ImageControllers';
import classes from 'src/layout/ImageUpload/ImageUpload.module.css';
import {
  calculatePositions,
  constrainToArea,
  drawViewport,
  getViewport,
} from 'src/layout/ImageUpload/imageUploadUtils';
import { useImageFile } from 'src/layout/ImageUpload/useImageFile';
import type { Position, ViewportType } from 'src/layout/ImageUpload/imageUploadUtils';

interface ImageCropperProps {
  viewport?: ViewportType;
  baseComponentId: string;
}

const MAX_ZOOM = 5;

// ImageCropper Component
export function ImageCropper({ baseComponentId, viewport }: ImageCropperProps) {
  const mobileView = useIsMobileOrTablet();
  const { saveImage, deleteImage } = useImageFile(baseComponentId);

  // Refs for canvas and image
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);

  // State management
  const [zoom, setZoom] = useState<number>(1);
  const [position, setPosition] = useState<Position>({ x: 0, y: 0 });
  const [imageSrc, setImageSrc] = useState<File | null>(null);

  const selectedViewport = getViewport(viewport);

  const minAllowedZoom = useMemo(() => {
    if (!imageRef.current) {
      return 0.1;
    }
    return Math.max(selectedViewport.width / imageRef.current.width, selectedViewport.height / imageRef.current.height);
  }, [selectedViewport]);

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
          viewport: selectedViewport,
        }),
      );
    },
    [zoom, selectedViewport],
  );

  // Constrains zoom changes from the canvas or controllers
  const handleZoomChange = useCallback(
    (newZoomValue: number) => {
      const newZoom = Math.max(minAllowedZoom, Math.min(newZoomValue, MAX_ZOOM));
      setZoom(newZoom);
      setPosition((currentPosition) =>
        constrainToArea({
          image: imageRef.current!,
          zoom: newZoom,
          position: currentPosition,
          viewport: selectedViewport,
        }),
      );
    },
    [minAllowedZoom, selectedViewport],
  );

  const handleFileUpload = (file: File) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result;

      if (typeof result === 'string') {
        const img = new Image();
        img.onload = () => {
          imageRef.current = img;
          const newMinZoom = Math.max(selectedViewport.width / img.width, selectedViewport.height / img.height);
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
            viewport={selectedViewport}
            onPositionChange={handlePositionChange}
            onZoomChange={handleZoomChange}
          />
        ) : (
          <div className={classes.placeholder} />
        )
      }
    >
      {imageSrc ? (
        <ImageControllers
          zoom={zoom}
          zoomLimits={{ minZoom: minAllowedZoom, maxZoom: MAX_ZOOM }}
          baseComponentId={baseComponentId}
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
