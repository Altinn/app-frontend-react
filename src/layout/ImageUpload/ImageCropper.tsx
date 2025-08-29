import React, { useCallback, useEffect, useRef, useState } from 'react';

import {
  ArrowCirclepathReverseIcon as RefreshCw,
  ScissorsFillIcon as Scissors,
  UploadIcon as Upload,
  ZoomMinusIcon as ZoomOut,
  ZoomPlusIcon as ZoomIn,
} from '@navikt/aksel-icons';

import styles from 'src/layout/ImageUpload/ImageCropper.module.css';

// Define types for state and props
type Position = {
  x: number;
  y: number;
};

interface ImageCropperProps {
  onCrop: (image: string) => void;
}

// ImageCropper Component
export const ImageCropper: React.FC<ImageCropperProps> = ({ onCrop }) => {
  // Refs for canvas and image
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);
  const canvasContainerRef = useRef<HTMLDivElement>(null); // Ref for the container to attach wheel event

  // State management
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [zoom, setZoom] = useState<number>(1);
  const [minAllowedZoom, setMinAllowedZoom] = useState<number>(0.1);
  const [position, setPosition] = useState<Position>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [startDrag, setStartDrag] = useState<Position>({ x: 0, y: 0 });
  const isCircle = true; // Fixed to circle for simplicity

  // Constants for viewport size
  const VIEWPORT_WIDTH = 300;
  const VIEWPORT_HEIGHT = 300;

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
    if (isCircle) {
      ctx.arc(canvas.width / 2, canvas.height / 2, VIEWPORT_WIDTH / 2, 0, Math.PI * 2, true);
    } else {
      ctx.rect(viewportX, viewportY, VIEWPORT_WIDTH, VIEWPORT_HEIGHT);
    }
    ctx.clip();

    ctx.drawImage(img, initialX, initialY, scaledWidth, scaledHeight);
    ctx.restore();

    // 4. Draw the dashed border
    ctx.beginPath();
    if (isCircle) {
      ctx.arc(canvas.width / 2, canvas.height / 2, VIEWPORT_WIDTH / 2, 0, Math.PI * 2, true);
    } else {
      ctx.rect(viewportX, viewportY, VIEWPORT_WIDTH, VIEWPORT_HEIGHT);
    }
    ctx.strokeStyle = 'white';
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 5]);
    ctx.stroke();
    ctx.setLineDash([]);
  }, [zoom, position, isCircle]);

  // useEffect to draw when state changes
  useEffect(() => {
    if (imageSrc) {
      draw();
    }
  }, [draw, imageSrc]);

  // This effect clamps the position when zoom changes
  useEffect(() => {
    if (!imageRef.current || !canvasRef.current) {
      return;
    }

    const img = imageRef.current;
    const scaledWidth = img.width * zoom;
    const scaledHeight = img.height * zoom;

    const clampX = scaledWidth > VIEWPORT_WIDTH ? (scaledWidth - VIEWPORT_WIDTH) / 2 : 0;
    const clampY = scaledHeight > VIEWPORT_HEIGHT ? (scaledHeight - VIEWPORT_HEIGHT) / 2 : 0;

    const newX = Math.max(-clampX, Math.min(position.x, clampX));
    const newY = Math.max(-clampY, Math.min(position.y, clampY));

    if (newX !== position.x || newY !== position.y) {
      setPosition({ x: newX, y: newY });
    }
  }, [zoom, imageSrc, position.x, position.y]);

  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          imageRef.current = img;

          // Calculate the minimum zoom to fit the viewport
          const newMinZoom = Math.max(VIEWPORT_WIDTH / img.width, VIEWPORT_HEIGHT / img.height);
          setMinAllowedZoom(newMinZoom);

          // Reset state for new image, ensuring zoom is at least the new minimum
          setZoom(Math.max(1, newMinZoom));
          setPosition({ x: 0, y: 0 });
          setImageSrc(event.target?.result as string);
        };
        img.src = event.target?.result as string;
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle mouse down for panning
  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
    setStartDrag({ x: e.clientX - position.x, y: e.clientY - position.y });
  };

  // Handle mouse move for panning, with boundary checks
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isDragging) {
      if (!imageRef.current || !canvasRef.current) {
        return;
      }

      const img = imageRef.current;
      const scaledWidth = img.width * zoom;
      const scaledHeight = img.height * zoom;

      const clampX = scaledWidth > VIEWPORT_WIDTH ? (scaledWidth - VIEWPORT_WIDTH) / 2 : 0;
      const clampY = scaledHeight > VIEWPORT_HEIGHT ? (scaledHeight - VIEWPORT_HEIGHT) / 2 : 0;

      const newX = e.clientX - startDrag.x;
      const newY = e.clientY - startDrag.y;

      const clampedX = Math.max(-clampX, Math.min(newX, clampX));
      const clampedY = Math.max(-clampY, Math.min(newY, clampY));

      setPosition({ x: clampedX, y: clampedY });
    }
  };

  // Handle mouse up to stop panning
  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Handle mouse wheel for zooming
  const handleWheel = useCallback(
    (e: WheelEvent) => {
      e.preventDefault();
      setZoom((currentZoom) => {
        const newZoom = currentZoom - e.deltaY * 0.001;
        return Math.max(minAllowedZoom, Math.min(newZoom, MAX_ZOOM));
      });
    },
    [minAllowedZoom, MAX_ZOOM],
  );

  // Effect to manually add wheel event listener with passive: false
  useEffect(() => {
    const container = canvasContainerRef.current;
    if (container) {
      container.addEventListener('wheel', handleWheel, { passive: false });
    }
    return () => {
      if (container) {
        container.removeEventListener('wheel', handleWheel);
      }
    };
  }, [handleWheel]);

  // Handle keyboard arrow keys for panning
  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
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

    const img = imageRef.current;
    const scaledWidth = img.width * zoom;
    const scaledHeight = img.height * zoom;

    const clampX = scaledWidth > VIEWPORT_WIDTH ? (scaledWidth - VIEWPORT_WIDTH) / 2 : 0;
    const clampY = scaledHeight > VIEWPORT_HEIGHT ? (scaledHeight - VIEWPORT_HEIGHT) / 2 : 0;

    const clampedX = Math.max(-clampX, Math.min(newX, clampX));
    const clampedY = Math.max(-clampY, Math.min(newY, clampY));

    setPosition({ x: clampedX, y: clampedY });
  };

  // Reset image state
  const handleReset = () => {
    setZoom(Math.max(1, minAllowedZoom));
    setPosition({ x: 0, y: 0 });
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

    if (isCircle) {
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
        {/* eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions*/}
        <div
          ref={canvasContainerRef}
          className={styles.canvasContainer}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onKeyDown={handleKeyDown}
          // eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex
          tabIndex={0}
          role='application'
          aria-label='Image cropping area'
        >
          {imageSrc ? (
            <canvas
              ref={canvasRef}
              width={500}
              height={500}
              className={styles.canvas}
            />
          ) : (
            <div className={styles.placeholder}>
              <Upload className={styles.placeholderIcon} />
              <p className={styles.placeholderText}>Upload an image to start cropping</p>
            </div>
          )}
        </div>
      </div>
      {/* Left side: Controls */}
      <div className={styles.controlsContainer}>
        <label
          htmlFor='image-upload'
          className={styles.uploadLabel}
        >
          <div className={styles.uploadButton}>
            <Upload className={styles.icon} />
            {imageSrc ? 'Change Image' : 'Upload Image'}
          </div>
          <input
            id='image-upload'
            type='file'
            accept='image/*'
            onChange={handleFileChange}
            className={styles.hiddenInput}
          />
        </label>

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
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setZoom(sliderValueToZoom(parseFloat(e.target.value)))
                  }
                  className={styles.zoomSlider}
                />
                <ZoomIn className={styles.zoomIcon} />
              </div>
            </div>

            <div className={styles.actionButtons}>
              <button
                onClick={handleReset}
                className={`${styles.button} ${styles.resetButton}`}
              >
                <RefreshCw className={styles.icon} /> Reset
              </button>
              <button
                onClick={handleCrop}
                className={`${styles.button} ${styles.cropButton}`}
              >
                <Scissors className={styles.icon} /> Crop
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
