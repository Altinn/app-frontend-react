import React, { useCallback, useEffect, useRef, useState } from 'react';

import { UploadIcon as Upload } from '@navikt/aksel-icons';

import { useIsMobileOrTablet } from 'src/hooks/useDeviceWidths';
import { DropzoneComponent } from 'src/layout/FileUpload/DropZone/DropzoneComponent';
import { ImageControllers } from 'src/layout/ImageUpload/ImageControllers';
import styles from 'src/layout/ImageUpload/ImageUpload.module.css';
import {
  calculatePositions,
  constrainToArea,
  drawViewport,
  getViewport,
} from 'src/layout/ImageUpload/imageUploadUtils';
import type { ViewportType } from 'src/layout/ImageUpload/imageUploadUtils';

// Define types for state and props
type Position = {
  x: number;
  y: number;
};

interface ImageCropperProps {
  viewport?: ViewportType;
  onCrop: (image: string) => void;
}

// ImageCropper Component
export function ImageCropper({ onCrop, viewport }: ImageCropperProps) {
  const mobileView = useIsMobileOrTablet();
  // Refs for canvas and image
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);

  // State management
  const [zoom, setZoom] = useState<number>(1);
  const [position, setPosition] = useState<Position>({ x: 0, y: 0 });

  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [minAllowedZoom, setMinAllowedZoom] = useState<number>(0.1);

  // Constants for viewport size
  const selectedViewport = getViewport(viewport);

  // Constants and functions for logarithmic zoom slider
  const MAX_ZOOM = 5;

  // This function handles drawing the image and the viewport on the canvas.
  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    const img = imageRef.current;

    if (!canvas || !img || !img.complete || !ctx) {
      return;
    }

    // Clear the canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const { imgX, imgY, scaledWidth, scaledHeight } = calculatePositions({ canvas, img, zoom, position });

    // 1. Draw the base image
    ctx.drawImage(img, imgX, imgY, scaledWidth, scaledHeight);

    // 2. Draw the semi-transparent overlay
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // 3. "Cut out" the viewport
    ctx.save();
    const viewportX = (canvas.width - selectedViewport.width) / 2;
    const viewportY = (canvas.height - selectedViewport.height) / 2;

    drawViewport({ ctx, x: viewportX, y: viewportY, selectedViewport });
    ctx.clip();
    ctx.drawImage(img, imgX, imgY, scaledWidth, scaledHeight);
    ctx.restore();

    // 4. Draw the dashed border
    drawViewport({ ctx, x: viewportX, y: viewportY, selectedViewport });
    ctx.strokeStyle = 'white';
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 5]);
    ctx.stroke();
    ctx.setLineDash([]);
  }, [zoom, position, selectedViewport]);

  // useEffect to draw when state changes
  useEffect(() => {
    if (imageSrc) {
      draw();
    }
  }, [draw, imageSrc]);

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }

    canvas.setPointerCapture(e.pointerId);

    const startDrag = { x: e.clientX - position.x, y: e.clientY - position.y };

    const handlePointerMove = (e: PointerEvent) => {
      if (!imageRef.current || !canvasRef.current) {
        return;
      }

      const draggedPosition = {
        x: e.clientX - startDrag.x,
        y: e.clientY - startDrag.y,
      };

      setPosition(
        constrainToArea({
          image: imageRef.current,
          zoom,
          position: draggedPosition,
          viewport: selectedViewport,
        }),
      );
    };

    const handlePointerUp = () => {
      if (canvas) {
        canvas.releasePointerCapture(e.pointerId);
      }
      document.removeEventListener('pointermove', handlePointerMove);
      document.removeEventListener('pointerup', handlePointerUp);
    };

    document.addEventListener('pointermove', handlePointerMove);
    document.addEventListener('pointerup', handlePointerUp);
  };

  // Update zoom while keeping the image constrained to the viewport
  const updateZoom = useCallback(
    (logarithmicZoomValue: number) => {
      if (!imageRef.current || !canvasRef.current) {
        return;
      }

      setPosition(
        constrainToArea({
          image: imageRef.current!,
          zoom: logarithmicZoomValue,
          position,
          viewport: selectedViewport,
        }),
      );
      setZoom(logarithmicZoomValue);
    },
    [position, selectedViewport],
  );

  // Handle mouse wheel for zooming
  const handleWheel = useCallback(
    (e: WheelEvent) => {
      e.preventDefault();
      const newZoom = zoom - e.deltaY * 0.001;
      const newZoomResult = Math.max(minAllowedZoom, Math.min(newZoom, MAX_ZOOM));

      updateZoom(newZoomResult);
    },
    [zoom, minAllowedZoom, updateZoom],
  );

  // Effect to manually add wheel event listener with passive: false
  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      canvas.addEventListener('wheel', handleWheel, { passive: false });
    }
    return () => {
      if (canvas) {
        canvas.removeEventListener('wheel', handleWheel);
      }
    };
  }, [handleWheel]);

  // Handle keyboard arrow keys for panning
  const handleKeyDown = (e: React.KeyboardEvent<HTMLCanvasElement>) => {
    if (!imageRef.current) {
      return;
    }

    const moveAmount = 10; // Pixels to move per key press
    let newX = position.x;
    let newY = position.y;

    switch (e.key) {
      case 'ArrowUp':
        e.preventDefault();
        newY -= moveAmount;
        break;
      case 'ArrowDown':
        e.preventDefault();
        newY += moveAmount;
        break;
      case 'ArrowLeft':
        e.preventDefault();
        newX -= moveAmount;
        break;
      case 'ArrowRight':
        e.preventDefault();
        newX += moveAmount;
        break;
      default:
        return; // Exit if it's not an arrow key
    }
    const newPosition = { x: newX, y: newY };

    setPosition(
      constrainToArea({
        image: imageRef.current!,
        zoom,
        position: newPosition,
        viewport: selectedViewport,
      }),
    );
  };

  const handleFileUpload = (file: File) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result;

      if (typeof result === 'string') {
        const img = new Image();
        img.onload = () => {
          imageRef.current = img;
          const newMinZoom = Math.max(selectedViewport.width / img.width, selectedViewport.height / img.height);
          setMinAllowedZoom(newMinZoom);
          setZoom(Math.max(1, newMinZoom));
          setPosition({ x: 0, y: 0 });
          setImageSrc(result);
        };
        img.src = result;
      }
    };
    reader.readAsDataURL(file);
  };

  // The main cropping logic
  const handleCrop = () => {
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

    onCrop(cropCanvas.toDataURL('image/png'));
  };

  const handleReset = () => {
    setZoom(Math.max(1, minAllowedZoom));
    setPosition({ x: 0, y: 0 });
  };

  return (
    <div className={styles.cropperContainer}>
      {/* Right side: Canvas */}
      <div className={styles.canvasContainerWrapper}>
        {imageSrc ? (
          <canvas
            onPointerDown={handlePointerDown}
            onKeyDown={handleKeyDown}
            tabIndex={0}
            ref={canvasRef}
            width={500}
            height={500}
            className={styles.canvas}
            aria-label='Image cropping area'
          />
        ) : (
          <div className={styles.placeholder}>
            <Upload className={styles.placeholderIcon} />
            <p className={styles.placeholderText}>Upload an image to start cropping</p>
          </div>
        )}
      </div>
      {imageSrc ? (
        <ImageControllers
          zoom={zoom}
          zoomLimits={{ minZoom: minAllowedZoom, maxZoom: MAX_ZOOM }}
          updateZoom={updateZoom}
          onFileUploaded={handleFileUpload}
          onReset={handleReset}
          onCrop={handleCrop}
        />
      ) : (
        <div className={styles.dropZoneWrapper}>
          <DropzoneComponent
            id='image-upload'
            isMobile={mobileView}
            maxFileSizeInMB={10}
            readOnly={false}
            onClick={(e) => e.preventDefault()}
            onDrop={(files) => handleFileUpload(files[0])}
            hasValidationMessages={false}
            validFileEndings={['.jpg', '.jpeg', '.png', '.gif']}
          />
        </div>
      )}
    </div>
  );
}
