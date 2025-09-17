export type Position = { x: number; y: number };
export enum CropForm {
  Square = 'square',
  Circle = 'circle',
}

export const VALID_FILE_ENDINGS = ['.jpg', '.jpeg', '.png', '.gif'];

export type CropAreaParams = { width?: number; height?: number; type?: CropForm.Square | CropForm.Circle } | undefined;
export type CropArea = { width: number; height: number; type: CropForm.Square | CropForm.Circle };

export const getCropArea = (cropArea?: CropAreaParams): CropArea => {
  const defaultSize = 300;

  const width = cropArea?.width ?? defaultSize;
  const height = cropArea?.height ?? defaultSize;

  let type = cropArea?.type ?? CropForm.Circle;

  // Force square if circle dimensions are mismatched
  if (type === CropForm.Circle && width !== height) {
    type = CropForm.Square;
  }

  return { width, height, type };
};

interface ConstrainToAreaParams {
  image: HTMLImageElement;
  zoom: number;
  position: Position;
  cropArea: CropArea;
}

export function constrainToArea({ image, zoom, position, cropArea }: ConstrainToAreaParams): Position {
  const scaledWidth = image.width * zoom;
  const scaledHeight = image.height * zoom;

  const clampX = scaledWidth > cropArea.width ? (scaledWidth - cropArea.width) / 2 : 0;
  const clampY = scaledHeight > cropArea.height ? (scaledHeight - cropArea.height) / 2 : 0;

  const newX = Math.max(-clampX, Math.min(position.x, clampX));
  const newY = Math.max(-clampY, Math.min(position.y, clampY));

  return { x: newX, y: newY };
}

interface ImagePlacementParams {
  canvas: HTMLCanvasElement;
  img: HTMLImageElement;
  zoom: number;
  position: Position;
}

export const imagePlacement = ({ canvas, img, zoom, position }: ImagePlacementParams) => {
  const scaledWidth = img.width * zoom;
  const scaledHeight = img.height * zoom;
  const imgX = (canvas.width - scaledWidth) / 2 + position.x;
  const imgY = (canvas.height - scaledHeight) / 2 + position.y;

  return { imgX, imgY, scaledWidth, scaledHeight };
};

type CropAreaPlacementParams = { canvas: HTMLCanvasElement; cropArea: CropArea };
type CropAreaPlacement = { cropAreaX: number; cropAreaY: number };

export const cropAreaPlacement = ({ canvas, cropArea }: CropAreaPlacementParams): CropAreaPlacement => {
  const cropAreaX = (canvas.width - cropArea.width) / 2;
  const cropAreaY = (canvas.height - cropArea.height) / 2;
  return { cropAreaX, cropAreaY };
};

interface DrawCropAreaParams {
  ctx: CanvasRenderingContext2D;
  cropArea: CropArea;
  x?: number;
  y?: number;
}

export function drawCropArea({ ctx, x = 0, y = 0, cropArea }: DrawCropAreaParams) {
  const { width, height, type } = cropArea;
  ctx.beginPath();
  if (type === CropForm.Circle) {
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

type CalculateMinZoomParams = { cropArea: CropArea; img: HTMLImageElement };
export const calculateMinZoom = ({ img, cropArea }: CalculateMinZoomParams) =>
  Math.max(cropArea.width / img.width, cropArea.height / img.height);

type ValidateFileParams = { file: File; validFileEndings: string[] };
export const validateFile = ({ file, validFileEndings }: ValidateFileParams) => {
  const errors: string[] = [];
  if (file.size > 10 * 1024 * 1024) {
    errors.push('image_upload_component.error_file_size_exceeded');
  }
  if (!validFileEndings.some((ending) => file.name.toLowerCase().endsWith(ending))) {
    errors.push('image_upload_component.error_invalid_file_type');
  }
  return errors;
};
