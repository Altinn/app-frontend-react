import React, { useState } from 'react';

import { DownloadIcon as Download } from '@navikt/aksel-icons';

import { ComponentStructureWrapper } from 'src/layout/ComponentStructureWrapper';
import { ImageCropper } from 'src/layout/ImageUpload/ImageUpload';
import { useItemWhenType } from 'src/utils/layout/useNodeItem';
import type { PropsFromGenericComponent } from 'src/layout';

export function ImageUploadComponent({ baseComponentId }: PropsFromGenericComponent<'ImageUpload'>) {
  const [croppedImage, setCroppedImage] = useState<string | null>(null);
  const { cropAsCircle } = useItemWhenType(baseComponentId, 'ImageUpload');

  return (
    <ComponentStructureWrapper baseComponentId={baseComponentId}>
      <ImageCropper
        onCrop={setCroppedImage}
        cropAsCircle={cropAsCircle}
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
