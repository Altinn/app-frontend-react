export type Viewport = { width: number; height: number; circle?: boolean };

export enum ViewportType {
  Square = '1:1',
  Rectangle4_3 = '4:3',
  Rectangle16_9 = '16:9',
  Circle = 'circle',
}

export const getViewport = (viewport?: ViewportType): Viewport => {
  switch (viewport) {
    case ViewportType.Square:
      return { width: 300, height: 300, circle: false };
    case ViewportType.Rectangle4_3:
      return { width: 400, height: 300, circle: false };
    case ViewportType.Rectangle16_9:
      return { width: 480, height: 270, circle: false };
    case ViewportType.Circle:
    default:
      return { width: 280, height: 280, circle: true };
  }
};

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

interface CalculatePositionsParams {
  canvas: HTMLCanvasElement;
  img: HTMLImageElement;
  zoom: number;
  position: { x: number; y: number };
}

export const calculatePositions = ({ canvas, img, zoom, position }: CalculatePositionsParams) => {
  const scaledWidth = img.width * zoom;
  const scaledHeight = img.height * zoom;
  const imgX = (canvas.width - scaledWidth) / 2 + position.x;
  const imgY = (canvas.height - scaledHeight) / 2 + position.y;

  return { imgX, imgY, scaledWidth, scaledHeight };
};

interface DrawViewportParams {
  ctx: CanvasRenderingContext2D;
  selectedViewport: Viewport;
  x?: number;
  y?: number;
}

export function drawViewport({ ctx, x = 0, y = 0, selectedViewport }: DrawViewportParams) {
  const { width, height, circle } = selectedViewport;
  ctx.beginPath();
  if (circle) {
    ctx.arc(x + width / 2, y + height / 2, width / 2, 0, Math.PI * 2);
  } else {
    ctx.rect(x, y, width, height);
  }
}

interface ZoomParams {
  minZoom: number;
  maxZoom: number;
}

interface CalculateZoomParams extends ZoomParams {
  value: number;
}

function getLogValues({ minZoom, maxZoom }: ZoomParams): { logScale: number; logMin: number } {
  const logMin = Math.log(minZoom);
  const logMax = Math.log(maxZoom);
  return { logScale: (logMax - logMin) / 100, logMin };
}

export function normalToLogZoom({ value, minZoom, maxZoom }: CalculateZoomParams): number {
  const { logScale, logMin } = getLogValues({ minZoom, maxZoom });
  return Math.exp(logMin + logScale * value);
}

export function logToNormalZoom({ value, minZoom, maxZoom }: CalculateZoomParams): number {
  const { logScale, logMin } = getLogValues({ minZoom, maxZoom });
  if (logScale === 0) {
    return 0;
  } // Avoid division by zero if minZoom equals maxZoom
  return (Math.log(value) - logMin) / logScale;
}
