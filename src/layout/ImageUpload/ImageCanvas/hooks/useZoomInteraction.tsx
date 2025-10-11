import { useCallback, useEffect } from 'react';
import type React from 'react';

interface UseZoomInteractionProps {
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  zoom: number;
  onZoomChange: (newZoom: number) => void;
}

export const useZoomInteraction = ({ canvasRef, zoom, onZoomChange }: UseZoomInteractionProps) => {
  const handleWheel = useCallback(
    (e: WheelEvent) => {
      e.preventDefault();
      onZoomChange(zoom - e.deltaY * 0.001);
    },
    [zoom, onZoomChange],
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }

    canvas.addEventListener('wheel', handleWheel, { passive: false });
    return () => canvas.removeEventListener('wheel', handleWheel);
  }, [handleWheel, canvasRef]);
};
