import React, { useState } from 'react';

import { DownloadIcon as Download } from '@navikt/aksel-icons';

import { ComponentStructureWrapper } from 'src/layout/ComponentStructureWrapper';
import { ImageCropper } from 'src/layout/ImageUpload/ImageUpload';
import { useItemWhenType } from 'src/utils/layout/useNodeItem';
import type { PropsFromGenericComponent } from 'src/layout';
import type { ViewportType } from 'src/layout/ImageUpload/imageUploadUtils';

export function ImageUploadComponent({ baseComponentId }: PropsFromGenericComponent<'ImageUpload'>) {
  const [croppedImage, setCroppedImage] = useState<string | null>(null);
  const { viewport } = useItemWhenType(baseComponentId, 'ImageUpload');

  return (
    <ComponentStructureWrapper baseComponentId={baseComponentId}>
      <ImageCropper
        onCrop={setCroppedImage}
        viewport={viewport as ViewportType}
      />
      {croppedImage && (
        <div>
          <h2>Cropped Result</h2>
          <div>
            <img
              src={croppedImage}
              alt='Cropped result'
            />
            <a
              href={croppedImage}
              download='cropped-image.png'
            >
              <Download />
              Download Image
            </a>
          </div>
        </div>
      )}
    </ComponentStructureWrapper>
  );
}
