import React, { useCallback, useEffect, useRef, useState } from 'react';

import classes from 'src/layout/ImageUpload/ImageCanvas.module.css';
import { calculatePositions, drawViewport } from 'src/layout/ImageUpload/imageUploadUtils';
import type { Position, Viewport } from 'src/layout/ImageUpload/imageUploadUtils';

// Props for the ImageCanvas component
interface ImageCanvasProps {
  imageRef: React.RefObject<HTMLImageElement | null>;
  zoom: number;
  position: Position;
  viewport: Viewport;
  onPositionChange: (newPosition: Position) => void;
  onZoomChange: (newZoom: number) => void;
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
}

const CANVAS_HEIGHT = 320;

export function ImageCanvas({
  imageRef,
  zoom,
  position,
  viewport,
  onPositionChange,
  onZoomChange,
  canvasRef,
}: ImageCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [canvasWidth, setCanvasWidth] = useState(800);

  // Handles all drawing operations on the canvas
  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    const img = imageRef.current;

    if (!canvas || !img?.complete || !ctx) {
      return;
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const { imgX, imgY, scaledWidth, scaledHeight } = calculatePositions({
      canvas,
      img,
      zoom,
      position,
    });

    ctx.drawImage(img, imgX, imgY, scaledWidth, scaledHeight);
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.save();

    const viewportX = (canvas.width - viewport.width) / 2;
    const viewportY = (canvas.height - viewport.height) / 2;

    drawViewport({ ctx, x: viewportX, y: viewportY, selectedViewport: viewport });
    ctx.clip();
    ctx.drawImage(img, imgX, imgY, scaledWidth, scaledHeight);
    ctx.restore();

    drawViewport({ ctx, x: viewportX, y: viewportY, selectedViewport: viewport });
    ctx.strokeStyle = 'white';
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 5]);
    ctx.stroke();
    ctx.setLineDash([]);
  }, [zoom, position, viewport, imageRef, canvasRef]);

  useEffect(() => {
    draw();
  }, [draw, canvasWidth]);

  // Observes the container size to make the canvas responsive
  useEffect(() => {
    const container = containerRef.current;
    if (!container) {
      return;
    }
    let animationFrameId: number | null = null;
    const resizeObserver = new ResizeObserver((entries) => {
      animationFrameId = window.requestAnimationFrame(() => {
        if (entries[0]) {
          setCanvasWidth(entries[0].contentRect.width);
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

  return (
    <div ref={containerRef}>
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
    </div>
  );
}
