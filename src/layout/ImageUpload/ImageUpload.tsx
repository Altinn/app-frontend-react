import React, { useCallback, useMemo, useRef, useState } from 'react';

import { UploadIcon as Upload } from '@navikt/aksel-icons';

import { AppCard } from 'src/app-components/Card/Card';
import { useIsMobileOrTablet } from 'src/hooks/useDeviceWidths';
import { DropzoneComponent } from 'src/layout/FileUpload/DropZone/DropzoneComponent';
import { ImageCanvas, type ImageCanvasHandle } from 'src/layout/ImageUpload/ImageCanvas'; // Adjust path as needed
import { ImageControllers } from 'src/layout/ImageUpload/ImageControllers';
import classes from 'src/layout/ImageUpload/ImageUpload.module.css';
import { constrainToArea, getViewport } from 'src/layout/ImageUpload/imageUploadUtils';
import type { Position, ViewportType } from 'src/layout/ImageUpload/imageUploadUtils';

interface ImageCropperProps {
  viewport?: ViewportType;
  onCrop: (image: string) => void;
}

const MAX_ZOOM = 5;

export function ImageCropper({ onCrop, viewport }: ImageCropperProps) {
  const mobileView = useIsMobileOrTablet();
  // Refs
  const imageRef = useRef<HTMLImageElement | null>(null);
  const imageCanvasRef = useRef<ImageCanvasHandle>(null);

  // State
  const [zoom, setZoom] = useState<number>(1);
  const [position, setPosition] = useState<Position>({ x: 0, y: 0 });
  const [imageSrc, setImageSrc] = useState<string | null>(null);

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
      if (!imageRef.current) {
        return;
      }
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
          setImageSrc(result);
        };
        img.src = result;
      }
    };
    reader.readAsDataURL(file);
  };

  // Calls the crop method on the child component
  const handleCrop = () => {
    const croppedImage = imageCanvasRef.current?.crop();
    if (croppedImage) {
      onCrop(croppedImage);
    }
  };

  const handleReset = () => {
    setZoom(Math.max(1, minAllowedZoom));
    setPosition({ x: 0, y: 0 });
  };

  return (
    <AppCard
      variant='default'
      mediaPosition='top'
      className={classes.imageUploadCard}
      media={
        imageSrc ? (
          <ImageCanvas
            ref={imageCanvasRef}
            imageRef={imageRef}
            zoom={zoom}
            position={position}
            viewport={selectedViewport}
            onPositionChange={handlePositionChange}
            onZoomChange={handleZoomChange}
          />
        ) : (
          <div className={classes.canvasSizingWrapper}>
            <div className={classes.placeholder}>
              <Upload className={classes.placeholderIcon} />
              <p className={classes.placeholderText}>Upload an image to start cropping</p>
            </div>
          </div>
        )
      }
    >
      {imageSrc ? (
        <ImageControllers
          zoom={zoom}
          zoomLimits={{ minZoom: minAllowedZoom, maxZoom: MAX_ZOOM }}
          updateZoom={handleZoomChange}
          onFileUploaded={handleFileUpload}
          onReset={handleReset}
          onCrop={handleCrop}
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
        />
      )}
    </AppCard>
  );
}
