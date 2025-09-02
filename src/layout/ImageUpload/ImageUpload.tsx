import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import {
  ScissorsFillIcon as Scissors,
  UploadIcon as Upload,
  ZoomMinusIcon as ZoomOut,
  ZoomPlusIcon as ZoomIn,
} from '@navikt/aksel-icons';

import styles from 'src/layout/ImageUpload/ImageUpload.module.css';
import { ImageUploadButton } from 'src/layout/ImageUpload/ImageUploadButton';
import { constrainToArea } from 'src/layout/ImageUpload/imageUploadUtils';

// Define types for state and props
type Position = {
  x: number;
  y: number;
};

interface ImageCropperProps {
  onCrop: (image: string) => void;
  cropAsCircle?: boolean;
}

// ImageCropper Component
export function ImageCropper({ onCrop, cropAsCircle = false }: ImageCropperProps) {
  // Refs for canvas and image
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);

  // State management
  const [zoom, setZoom] = useState<number>(1);
  const [position, setPosition] = useState<Position>({ x: 0, y: 0 });

  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [minAllowedZoom, setMinAllowedZoom] = useState<number>(0.1);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [startDrag, setStartDrag] = useState<Position>({ x: 0, y: 0 });

  // Constants for viewport size
  const VIEWPORT_WIDTH = 300;
  const VIEWPORT_HEIGHT = 300;
  const viewport = useMemo(() => ({ width: VIEWPORT_WIDTH, height: VIEWPORT_HEIGHT }), []);

  // Constants and functions for logarithmic zoom slider
  const MAX_ZOOM = 5;
  const logMin = Math.log(minAllowedZoom);
  const logMax = Math.log(MAX_ZOOM);
  const logScale = (logMax - logMin) / 100; // Scale for a 0-100 slider

  // Converts a linear slider value (0-100) to a logarithmic zoom value
  const sliderValueToZoom = (value: number) => Math.exp(logMin + logScale * value);

  // Converts a zoom value back to a linear slider value (0-100)
  const zoomToSliderValue = (zoomValue: number) => (Math.log(zoomValue) - logMin) / logScale;

  // This function handles drawing the image and the viewport on the canvas.
  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      return;
    }

    const img = imageRef.current;
    if (!img || !img.complete) {
      return;
    }

    // Clear the canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const scaledWidth = img.width * zoom;
    const scaledHeight = img.height * zoom;
    const initialX = (canvas.width - scaledWidth) / 2 + position.x;
    const initialY = (canvas.height - scaledHeight) / 2 + position.y;

    // 1. Draw the base image
    ctx.drawImage(img, initialX, initialY, scaledWidth, scaledHeight);

    // 2. Draw the semi-transparent overlay
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // 3. "Cut out" the viewport
    ctx.save();
    const viewportX = (canvas.width - VIEWPORT_WIDTH) / 2;
    const viewportY = (canvas.height - VIEWPORT_HEIGHT) / 2;

    ctx.beginPath();
    if (cropAsCircle) {
      ctx.arc(canvas.width / 2, canvas.height / 2, VIEWPORT_WIDTH / 2, 0, Math.PI * 2, true);
    } else {
      ctx.rect(viewportX, viewportY, VIEWPORT_WIDTH, VIEWPORT_HEIGHT);
    }
    ctx.clip();

    ctx.drawImage(img, initialX, initialY, scaledWidth, scaledHeight);
    ctx.restore();

    // 4. Draw the dashed border
    ctx.beginPath();
    if (cropAsCircle) {
      ctx.arc(canvas.width / 2, canvas.height / 2, VIEWPORT_WIDTH / 2, 0, Math.PI * 2, true);
    } else {
      ctx.rect(viewportX, viewportY, VIEWPORT_WIDTH, VIEWPORT_HEIGHT);
    }
    ctx.strokeStyle = 'white';
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 5]);
    ctx.stroke();
    ctx.setLineDash([]);
  }, [zoom, position, cropAsCircle]);

  // useEffect to draw when state changes
  useEffect(() => {
    if (imageSrc) {
      draw();
    }
  }, [draw, imageSrc]);

  // Handle mouse down for panning
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    setIsDragging(true);
    setStartDrag({ x: e.clientX - position.x, y: e.clientY - position.y });
  };

  // Handle mouse move for panning, with boundary checks
  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (isDragging) {
      if (!imageRef.current || !canvasRef.current) {
        return;
      }

      const draggedPosition = { x: e.clientX - startDrag.x, y: e.clientY - startDrag.y };

      setPosition(
        constrainToArea({
          image: imageRef.current,
          zoom,
          position: draggedPosition,
          viewport,
        }),
      );
    }
  };

  // Handle mouse up to stop panning
  const handleMouseUp = () => {
    setIsDragging(false);
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
          viewport,
        }),
      );
      setZoom(logarithmicZoomValue);
    },
    [position, viewport],
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

  // Handle slider change for zooming
  const handleSliderZoom = (e: React.ChangeEvent<HTMLInputElement>) => {
    const logarithmicZoomValue = sliderValueToZoom(parseFloat(e.target.value));
    updateZoom(logarithmicZoomValue);
  };

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
        viewport,
      }),
    );
  };

  const onFileUploaded = (img: HTMLImageElement, src: string) => {
    imageRef.current = img;
    const newMinZoom = Math.max(VIEWPORT_WIDTH / img.width, VIEWPORT_HEIGHT / img.height);
    setMinAllowedZoom(newMinZoom);
    setZoom(Math.max(1, newMinZoom));
    setPosition({ x: 0, y: 0 });
    setImageSrc(src);
  };

  // The main cropping logic
  const handleCrop = () => {
    if (!imageRef.current || !canvasRef.current) {
      return;
    }

    const canvas = canvasRef.current;
    const img = imageRef.current;

    const cropCanvas = document.createElement('canvas');
    cropCanvas.width = VIEWPORT_WIDTH;
    cropCanvas.height = VIEWPORT_HEIGHT;
    const cropCtx = cropCanvas.getContext('2d');
    if (!cropCtx) {
      return;
    }

    const scaledWidth = img.width * zoom;
    const scaledHeight = img.height * zoom;

    const imgX = (canvas.width - scaledWidth) / 2 + position.x;
    const imgY = (canvas.height - scaledHeight) / 2 + position.y;

    const viewportX = (canvas.width - VIEWPORT_WIDTH) / 2;
    const viewportY = (canvas.height - VIEWPORT_HEIGHT) / 2;

    const sourceX = (viewportX - imgX) / zoom;
    const sourceY = (viewportY - imgY) / zoom;
    const sourceWidth = VIEWPORT_WIDTH / zoom;
    const sourceHeight = VIEWPORT_HEIGHT / zoom;

    cropCtx.drawImage(img, sourceX, sourceY, sourceWidth, sourceHeight, 0, 0, VIEWPORT_WIDTH, VIEWPORT_HEIGHT);

    if (cropAsCircle) {
      cropCtx.globalCompositeOperation = 'destination-in';
      cropCtx.beginPath();
      cropCtx.arc(VIEWPORT_WIDTH / 2, VIEWPORT_HEIGHT / 2, VIEWPORT_WIDTH / 2, 0, Math.PI * 2);
      cropCtx.fill();
    }

    onCrop(cropCanvas.toDataURL('image/png'));
  };

  return (
    <div className={styles.cropperContainer}>
      {/* Right side: Canvas */}
      <div className={styles.canvasContainerWrapper}>
        {imageSrc ? (
          <canvas
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
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
      {/* Left side: Controls */}
      <div className={styles.controlsContainer}>
        <ImageUploadButton
          imgSrc={imageSrc}
          setImgSrc={setImageSrc}
          onFileUploaded={onFileUploaded}
        />
        {imageSrc && (
          <div className={styles.controlsContainer}>
            <div className={styles.controlSection}>
              <label
                htmlFor='zoom'
                className={styles.label}
              >
                Zoom
              </label>
              <div className={styles.zoomControls}>
                <ZoomOut className={styles.zoomIcon} />
                <input
                  id='zoom'
                  type='range'
                  min='0'
                  max='100'
                  step='0.1'
                  value={zoomToSliderValue(zoom)}
                  onChange={handleSliderZoom}
                  className={styles.zoomSlider}
                />
                <ZoomIn className={styles.zoomIcon} />
              </div>
            </div>

            <button
              onClick={handleCrop}
              className={`${styles.button} ${styles.cropButton}`}
            >
              <Scissors className={styles.icon} /> Crop
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
