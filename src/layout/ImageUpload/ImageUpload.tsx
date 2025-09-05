import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { UploadIcon as Upload } from '@navikt/aksel-icons';

import { AppCard } from 'src/app-components/Card/Card';
import { useAttachmentsUploader } from 'src/features/attachments/hooks';
import { useIsMobileOrTablet } from 'src/hooks/useDeviceWidths';
import { DropzoneComponent } from 'src/layout/FileUpload/DropZone/DropzoneComponent';
import { ImageControllers } from 'src/layout/ImageUpload/ImageControllers';
import classes from 'src/layout/ImageUpload/ImageUpload.module.css';
import {
  calculatePositions,
  constrainToArea,
  drawViewport,
  getViewport,
} from 'src/layout/ImageUpload/imageUploadUtils';
import { useIndexedId } from 'src/utils/layout/DataModelLocation';
import type { IDataModelBindingsSimple } from 'src/layout/common.generated';
import type { ViewportType } from 'src/layout/ImageUpload/imageUploadUtils';

// Define types for state and props
type Position = {
  x: number;
  y: number;
};

interface ImageCropperProps {
  dataModelBindings?: IDataModelBindingsSimple;
  viewport?: ViewportType;
  baseComponentId: string;
}

// Constants for canvas size
const CANVAS_HEIGHT = 320;
// Constants for zoom limits
const MAX_ZOOM = 5;

// ImageCropper Component
export function ImageCropper({ baseComponentId, viewport, dataModelBindings }: ImageCropperProps) {
  const mobileView = useIsMobileOrTablet();
  const indexedId = useIndexedId(baseComponentId);
  const uploadAttachment = useAttachmentsUploader();

  // Refs for canvas and image
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);
  const containerRef = useRef<HTMLDivElement>(null); // Ref to measure the container's size

  // State management
  const [zoom, setZoom] = useState<number>(1);
  const [position, setPosition] = useState<Position>({ x: 0, y: 0 });
  const [imageSrc, setImageSrc] = useState<File | null>(null);
  const [canvasWidth, setCanvasWidth] = useState(800);
  //bare midlertidig for å kunne laste ned resultatet som blir lagret i backend
  const [previewImage, setPreviewImage] = React.useState<string | null>(null);

  // Constants for viewport size
  const selectedViewport = getViewport(viewport);

  const minAllowedZoom = useMemo(() => {
    if (!imageRef.current) {
      return 0.1;
    }
    return Math.max(selectedViewport.width / imageRef.current.width, selectedViewport.height / imageRef.current.height);
  }, [selectedViewport]);

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

  // Redraw whenever the image or canvas width changes.
  useEffect(() => {
    if (imageSrc) {
      draw();
    }
  }, [draw, imageSrc, canvasWidth]);

  // This effect observes the container size and resizes the canvas drawing buffer
  useEffect(() => {
    const container = containerRef.current;
    if (!container) {
      return;
    }

    let animationFrameId: number | null = null;

    const resizeObserver = new ResizeObserver((entries) => {
      animationFrameId = window.requestAnimationFrame(() => {
        const entry = entries[0];
        if (entry) {
          setCanvasWidth(entry.contentRect.width);
        }
      });
    });

    resizeObserver.observe(container);

    return () => {
      if (animationFrameId) {
        window.cancelAnimationFrame(animationFrameId);
      }
      resizeObserver.disconnect();
    };
  }, []);

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

      // Use the file now
      uploadAttachment({
        files: [imageFile],
        nodeId: indexedId,
        dataModelBindings,
      });
      setPreviewImage(cropCanvas.toDataURL('image/png'));
    }, 'image/png');
  };

  return (
    <>
      <AppCard
        variant='default'
        mediaPosition='top'
        className={classes.imageUploadCard}
        media={
          <div
            ref={containerRef}
            className={classes.canvasSizingWrapper}
          >
            {imageSrc ? (
              <canvas
                onPointerDown={handlePointerDown}
                onKeyDown={handleKeyDown}
                tabIndex={0}
                ref={canvasRef}
                width={canvasWidth}
                height={CANVAS_HEIGHT}
                className={classes.canvas}
                aria-label='Image cropping area'
              />
            ) : (
              <div className={classes.placeholder}>
                <Upload className={classes.placeholderIcon} />
                <p className={classes.placeholderText}>Upload an image to start cropping</p>
              </div>
            )}
          </div>
        }
      >
        {imageSrc ? (
          <ImageControllers
            zoom={zoom}
            zoomLimits={{ minZoom: minAllowedZoom, maxZoom: MAX_ZOOM }}
            updateZoom={updateZoom}
            onSave={handleSave}
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
          />
        )}
      </AppCard>
      {/*Fjern dette under senere*/}
      {previewImage && (
        <a
          href={previewImage}
          download='cropped-image.png'
        >
          Download Image
        </a>
      )}
    </>
  );
}
