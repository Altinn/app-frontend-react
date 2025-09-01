interface ConstrainToAreaParams {
  image: HTMLImageElement;
  zoom: number;
  position: { x: number; y: number };
  viewport: { width: number; height: number };
}

export function constrainToArea({ image, zoom, position, viewport }: ConstrainToAreaParams): {
  x: number;
  y: number;
} {
  const scaledWidth = image.width * zoom;
  const scaledHeight = image.height * zoom;

  const clampX = scaledWidth > viewport.width ? (scaledWidth - viewport.width) / 2 : 0;
  const clampY = scaledHeight > viewport.height ? (scaledHeight - viewport.height) / 2 : 0;

  const newX = Math.max(-clampX, Math.min(position.x, clampX));
  const newY = Math.max(-clampY, Math.min(position.y, clampY));

  return { x: newX, y: newY };
}
