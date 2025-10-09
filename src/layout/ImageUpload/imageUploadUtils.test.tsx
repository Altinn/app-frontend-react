import {
  calculateMinZoom,
  constrainToArea,
  cropAreaPlacement,
  CropForm,
  drawCropArea,
  getCropArea,
  imagePlacement,
  isAnimationFile,
  logToNormalZoom,
  normalToLogZoom,
  validateFile,
} from 'src/layout/ImageUpload/imageUploadUtils';

const mockImage = (width: number, height: number): HTMLImageElement => {
  const img = new Image();
  Object.defineProperty(img, 'width', { get: () => width });
  Object.defineProperty(img, 'height', { get: () => height });
  return img;
};
const mockCanvas = (): HTMLCanvasElement => {
  const canvas = document.createElement('canvas');
  Object.defineProperty(canvas, 'width', { get: () => 400 });
  Object.defineProperty(canvas, 'height', { get: () => 400 });
  return canvas;
};

describe('getCropArea', () => {
  it('returns default crop area when no params are provided', () => {
    expect(getCropArea()).toEqual({ width: 250, height: 250, type: CropForm.Circle });
  });

  it('returns provided width and height', () => {
    expect(getCropArea({ width: 300, height: 200, type: CropForm.Rectangle })).toEqual({
      width: 300,
      height: 200,
      type: CropForm.Rectangle,
    });
    expect(getCropArea({ width: 200, height: 200, type: CropForm.Circle })).toEqual({
      width: 200,
      height: 200,
      type: CropForm.Circle,
    });
  });

  it('returns default size for missing dimensions', () => {
    expect(getCropArea({ width: 300, type: CropForm.Rectangle })).toEqual({
      width: 300,
      height: 250,
      type: CropForm.Rectangle,
    });
    expect(getCropArea({ height: 200, type: CropForm.Rectangle })).toEqual({
      width: 250,
      height: 200,
      type: CropForm.Rectangle,
    });
  });

  it('returns the smallest dimension if type is circle and width and height are different', () => {
    expect(getCropArea({ width: 300, height: 200, type: CropForm.Circle })).toEqual({
      width: 200,
      height: 200,
      type: CropForm.Circle,
    });
  });
});

describe('constrainToArea', () => {
  const image = mockImage(500, 500);
  const cropArea = { width: 200, height: 200, type: CropForm.Rectangle };
  const wantedPosition = { x: 200, y: 200 };

  it('should clamp position to max offset for image larger than crop area', () => {
    const zoom = 1;
    const constrainedPosition = constrainToArea({ image, zoom, position: wantedPosition, cropArea });
    expect(constrainedPosition).toEqual({ x: 150, y: 150 });
  });

  it('should allow wanted position when image is scaled because of zoomed in', () => {
    const zoom = 2;
    const constrainedPosition = constrainToArea({ image, zoom, position: wantedPosition, cropArea });
    expect(constrainedPosition).toEqual({ x: 200, y: 200 });
  });
});

describe('imagePlacement', () => {
  const image = mockImage(500, 500);
  const canvas = mockCanvas();
  const position = { x: 50, y: -30 };

  it('calculates centered position and scaled size with zoom = 1', () => {
    const zoom = 1;
    const result = imagePlacement({ canvas, img: image, zoom, position });

    expect(result).toEqual({
      scaledWidth: 500,
      scaledHeight: 500,
      imgX: 0,
      imgY: -80,
    });
  });

  it('calculates centered position and scaled size with zoom = 2', () => {
    const zoom = 2;
    const result = imagePlacement({ canvas, img: image, zoom, position });
    expect(result).toEqual({
      scaledWidth: 1000,
      scaledHeight: 1000,
      imgX: -250,
      imgY: -330,
    });
  });
});

describe('cropAreaPlacement', () => {
  it('calculates centered crop area position within canvas', () => {
    const canvas = mockCanvas();
    const cropArea = { width: 200, height: 200, type: CropForm.Rectangle };
    const cropAreaCenter = cropAreaPlacement({ canvas, cropArea });
    expect(cropAreaCenter).toEqual({ cropAreaX: 100, cropAreaY: 100 });
  });

  it('calculates centered crop area position with non-square area', () => {
    const canvas = mockCanvas();
    const cropArea = { width: 300, height: 200, type: CropForm.Rectangle };
    const cropAreaCenter = cropAreaPlacement({ canvas, cropArea });
    expect(cropAreaCenter).toEqual({ cropAreaX: 50, cropAreaY: 100 });
  });
});

describe('drawCropArea', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const mockCtx = {
    beginPath: jest.fn(),
    arc: jest.fn(),
    rect: jest.fn(),
  } as unknown as CanvasRenderingContext2D;

  const cropWidth = 100;
  const cropHeight = 100;

  it('should draw a circle crop area at the given position', () => {
    const cropArea = { width: cropWidth, height: cropHeight, type: CropForm.Circle };

    drawCropArea({ ctx: mockCtx, cropArea });
    expect(mockCtx.beginPath).toHaveBeenCalled();
    expect(mockCtx.rect).not.toHaveBeenCalled();
  });

  it('should draw a rectangle crop area at the given position', () => {
    const cropArea = { width: cropWidth, height: cropHeight, type: CropForm.Rectangle };
    drawCropArea({ ctx: mockCtx, cropArea });
    expect(mockCtx.beginPath).toHaveBeenCalled();
    expect(mockCtx.arc).not.toHaveBeenCalled();
  });
});

describe('normalToLogZoom', () => {
  it('calculates zoom correctly within min and max bounds', () => {
    const minZoom = 0.5;
    const maxZoom = 4;
    expect(normalToLogZoom({ value: 0, minZoom, maxZoom })).toBeCloseTo(minZoom);
    expect(normalToLogZoom({ value: 100, minZoom, maxZoom })).toBeCloseTo(maxZoom);
    expect(normalToLogZoom({ value: 50, minZoom, maxZoom })).toBeCloseTo(Math.sqrt(minZoom * maxZoom));
  });
});

describe('logToNormalZoom', () => {
  it('calculates normal zoom correctly within min and max bounds', () => {
    const minZoom = 0.5;
    const maxZoom = 4;
    expect(logToNormalZoom({ value: minZoom, minZoom, maxZoom })).toBeCloseTo(0);
    expect(logToNormalZoom({ value: maxZoom, minZoom, maxZoom })).toBeCloseTo(100);
    expect(logToNormalZoom({ value: Math.sqrt(minZoom * maxZoom), minZoom, maxZoom })).toBeCloseTo(50);
  });

  it('returns NaN if log scale is zero', () => {
    const minZoom = 2;
    const maxZoom = 2;
    expect(logToNormalZoom({ value: 2, minZoom, maxZoom })).toBe(0);
  });
});

describe('calculateMinZoom', () => {
  it('calculates minimum zoom to cover crop area', () => {
    const cropArea = { width: 200, height: 100, type: CropForm.Rectangle };
    const image = mockImage(400, 400);
    expect(calculateMinZoom({ img: image, cropArea })).toBe(0.5);
    const wideImage = mockImage(200, 100);
    expect(calculateMinZoom({ img: wideImage, cropArea })).toBe(1);
  });
});

describe('validateFile', () => {
  const typeError = 'image_upload_component.error_invalid_file_type';
  const sizeError = 'image_upload_component.error_file_size_exceeded';
  const maxSize = 10 * 1024 * 1024; // 10 MB

  it('returns error for undefined file', () => {
    expect(validateFile(undefined)).toEqual([typeError]);
  });

  it('returns error for non-image file type', () => {
    const file = new File(['dummy content'], 'test.txt', { type: 'text/plain' });
    expect(validateFile(file)).toEqual([typeError]);
  });

  it('returns error for file exceeding max size', () => {
    const bigBuffer = new Uint8Array(maxSize + 1);
    const file = new File([bigBuffer], 'bigimage.png', { type: 'image/png' });
    expect(validateFile(file)).toEqual([sizeError]);
  });

  it('returns both errors for invalid type and size', () => {
    const bigBuffer = new Uint8Array(maxSize + 1);
    const file = new File([bigBuffer], 'bigfile.txt', { type: 'text/plain' });
    expect(validateFile(file)).toEqual([sizeError, typeError]);
  });

  it('returns no errors for valid image file', () => {
    const file = new File([new Uint8Array(maxSize)], 'image.png', { type: 'image/png' });
    expect(validateFile(file)).toEqual([]);
  });
});

describe('isAnimationFile', () => {
  it('returns true for .gif files', () => {
    expect(isAnimationFile('image/gif')).toBe(true);
    expect(isAnimationFile('IMAGE/GIF')).toBe(true);
  });
  it('returns true for .apng files', () => {
    expect(isAnimationFile('image/apng')).toBe(true);
    expect(isAnimationFile('IMAGE/APNG')).toBe(true);
  });
  it('returns true for .webp files', () => {
    expect(isAnimationFile('image/webp')).toBe(true);
    expect(isAnimationFile('IMAGE/WEBP')).toBe(true);
  });
  it('returns false for non-animated image types', () => {
    expect(isAnimationFile('image/png')).toBe(false);
  });
});
