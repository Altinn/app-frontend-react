import React from 'react';

import { useLanguage } from 'src/features/language/useLanguage';
import { useCanvasDraw } from 'src/layout/ImageUpload/ImageCanvas/hooks/useCanvasDraw';
import { useDragInteraction } from 'src/layout/ImageUpload/ImageCanvas/hooks/useDragInteraction';
import { useKeyboardNavigation } from 'src/layout/ImageUpload/ImageCanvas/hooks/useKeyboardNavigation';
import { useZoomInteraction } from 'src/layout/ImageUpload/ImageCanvas/hooks/useZoomInteraction';
import classes from 'src/layout/ImageUpload/ImageCanvas/ImageCanvas.module.css';
import { ImagePreview } from 'src/layout/ImageUpload/ImageCanvas/ImagePreview';
import { useImageFile } from 'src/layout/ImageUpload/useImageFile';
import type { CropArea, Position } from 'src/layout/ImageUpload/imageUploadUtils';
interface ImageCanvasProps {
  imageRef: React.RefObject<HTMLImageElement | null>;
  zoom: number;
  position: Position;
  cropArea: CropArea;
  baseComponentId: string;
  onPositionChange: (newPosition: Position) => void;
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
  onPositionChange,
  onZoomChange,
  canvasRef,
}: ImageCanvasProps) {
  const { storedImage, imageUrl } = useImageFile(baseComponentId);
  const { langAsString } = useLanguage();

  useCanvasDraw({ canvasRef, imageRef, zoom, position, cropArea });
  useZoomInteraction({ canvasRef, zoom, onZoomChange });
  const { handlePointerDown } = useDragInteraction({ canvasRef, position, onPositionChange });
  const { handleKeyDown } = useKeyboardNavigation({ position, onPositionChange });

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
