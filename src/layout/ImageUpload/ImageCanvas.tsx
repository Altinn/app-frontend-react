import React, { useCallback, useEffect, useRef } from 'react';

import { Spinner } from '@digdir/designsystemet-react';

import { useLanguage } from 'src/features/language/useLanguage';
import { useIsMobileOrTablet } from 'src/hooks/useDeviceWidths';
import classes from 'src/layout/ImageUpload/ImageCanvas.module.css';
import { cropAreaPlacement, drawCropArea, imagePlacement } from 'src/layout/ImageUpload/imageUploadUtils';
import { useImageFile } from 'src/layout/ImageUpload/useImageFile';
import type { CropArea, Position } from 'src/layout/ImageUpload/imageUploadUtils';

// Props for the ImageCanvas component
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
const CANVAS_WIDTH = 800;
const MOBILE_CANVAS_WIDTH = 400;

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
  const containerRef = useRef<HTMLDivElement>(null);
  const { storedImage, imageUrl } = useImageFile(baseComponentId);
  const mobileView = useIsMobileOrTablet();
  const canvasWidth = mobileView ? MOBILE_CANVAS_WIDTH : CANVAS_WIDTH;
  const { langAsString } = useLanguage();

  // Handles all drawing operations on the canvas
  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    const img = imageRef.current;

    if (!canvas || !img?.complete || !ctx) {
      return;
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const { imgX, imgY, scaledWidth, scaledHeight } = imagePlacement({
      canvas,
      img,
      zoom,
      position,
    });

    ctx.drawImage(img, imgX, imgY, scaledWidth, scaledHeight);
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.save();

    const { cropAreaX, cropAreaY } = cropAreaPlacement({ canvas, cropArea });
    drawCropArea({ ctx, x: cropAreaX, y: cropAreaY, cropArea });
    ctx.clip();
    ctx.drawImage(img, imgX, imgY, scaledWidth, scaledHeight);
    ctx.restore();

    drawCropArea({ ctx, x: cropAreaX, y: cropAreaY, cropArea });
    ctx.strokeStyle = 'white';
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 5]);
    ctx.stroke();
    ctx.setLineDash([]);
  }, [zoom, position, cropArea, imageRef, canvasRef]);

  useEffect(() => {
    draw();
  }, [draw]);

  // Handles panning via pointer events (mouse/touch)
  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }
    canvas.setPointerCapture(e.pointerId);
    const startDrag = { x: e.clientX - position.x, y: e.clientY - position.y };

    const handlePointerMove = (moveEvent: PointerEvent) => {
      onPositionChange({
        x: moveEvent.clientX - startDrag.x,
        y: moveEvent.clientY - startDrag.y,
      });
    };
    const handlePointerUp = () => {
      canvas.releasePointerCapture(e.pointerId);
      document.removeEventListener('pointermove', handlePointerMove);
      document.removeEventListener('pointerup', handlePointerUp);
    };
    document.addEventListener('pointermove', handlePointerMove);
    document.addEventListener('pointerup', handlePointerUp);
  };

  // Handles zooming via the mouse wheel
  const handleWheel = useCallback(
    (e: WheelEvent) => {
      e.preventDefault();
      onZoomChange(zoom - e.deltaY * 0.001);
    },
    [zoom, onZoomChange],
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      canvas.addEventListener('wheel', handleWheel, { passive: false });
    }
    return () => {
      canvas?.removeEventListener('wheel', handleWheel);
    };
  }, [handleWheel, canvasRef]);

  // Handles panning via keyboard arrow keys
  const handleKeyDown = (e: React.KeyboardEvent<HTMLCanvasElement>) => {
    const moveAmount = 10;
    const keyMap: Record<string, () => void> = {
      ArrowUp: () => onPositionChange({ ...position, y: position.y - moveAmount }),
      ArrowDown: () => onPositionChange({ ...position, y: position.y + moveAmount }),
      ArrowLeft: () => onPositionChange({ ...position, x: position.x - moveAmount }),
      ArrowRight: () => onPositionChange({ ...position, x: position.x + moveAmount }),
    };

    if (keyMap[e.key]) {
      e.preventDefault();
      keyMap[e.key]();
    }
  };

  if (storedImage) {
    return (
      <div className={classes.placeholder}>
        {storedImage.uploaded ? (
          <img
            src={imageUrl}
            alt={storedImage.data?.filename}
            className={classes.uploadedImage}
          />
        ) : (
          <Spinner
            aria-hidden='true'
            data-size='lg'
            aria-label={langAsString('general.loading')}
          />
        )}
      </div>
    );
  }
  if (!imageRef.current) {
    return <div className={classes.placeholder} />;
  }

  return (
    <div ref={containerRef}>
      <canvas
        onPointerDown={handlePointerDown}
        onKeyDown={handleKeyDown}
        tabIndex={0}
        ref={canvasRef}
        height={CANVAS_HEIGHT}
        width={canvasWidth}
        className={classes.canvas}
        aria-label='Image cropping area'
      />
    </div>
  );
}
