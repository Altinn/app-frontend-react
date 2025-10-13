import React, { useCallback } from 'react';

import { useLanguage } from 'src/features/language/useLanguage';
import { useCanvasDraw } from 'src/layout/ImageUpload/ImageCanvas/hooks/useCanvasDraw';
import { useDragInteraction } from 'src/layout/ImageUpload/ImageCanvas/hooks/useDragInteraction';
import { useKeyboardNavigation } from 'src/layout/ImageUpload/ImageCanvas/hooks/useKeyboardNavigation';
import { useZoomInteraction } from 'src/layout/ImageUpload/ImageCanvas/hooks/useZoomInteraction';
import classes from 'src/layout/ImageUpload/ImageCanvas/ImageCanvas.module.css';
import { ImagePreview } from 'src/layout/ImageUpload/ImageCanvas/ImagePreview';
import { constrainToArea, type CropArea, type Position } from 'src/layout/ImageUpload/imageUploadUtils';
import { useImageFile } from 'src/layout/ImageUpload/useImageFile';
interface ImageCanvasProps {
  imageRef: React.RefObject<HTMLImageElement | null>;
  zoom: number;
  position: Position;
  cropArea: CropArea;
  baseComponentId: string;
  setPosition: (newPosition: Position) => void;
  onZoomChange: (newZoom: number) => void;
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
}

const CANVAS_HEIGHT = 320;
const CANVAS_WIDTH = 1000;

export function ImageCanvas({
  imageRef,
  zoom,
  position,
  cropArea,
  baseComponentId,
  setPosition,
  onZoomChange,
  canvasRef,
}: ImageCanvasProps) {
  const { storedImage, imageUrl } = useImageFile(baseComponentId);
  const { langAsString } = useLanguage();

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
    [zoom, cropArea, setPosition, imageRef],
  );

  useCanvasDraw({ canvasRef, imageRef, zoom, position, cropArea });
  useZoomInteraction({ canvasRef, zoom, onZoomChange });
  const { handlePointerDown } = useDragInteraction({ canvasRef, position, onPositionChange: handlePositionChange });
  const { handleKeyDown } = useKeyboardNavigation({ position, onPositionChange: handlePositionChange });

  if (storedImage) {
    return (
      <ImagePreview
        storedImage={storedImage}
        imageUrl={imageUrl}
      />
    );
  }

  return (
    <canvas
      onPointerDown={handlePointerDown}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      ref={canvasRef}
      height={CANVAS_HEIGHT}
      width={CANVAS_WIDTH}
      className={classes.canvas}
      aria-label={langAsString('image_upload_component.crop_area')}
    />
  );
}
