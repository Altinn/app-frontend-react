import React, { useState } from 'react';

import { DownloadIcon as Download } from '@navikt/aksel-icons';

import { ComponentStructureWrapper } from 'src/layout/ComponentStructureWrapper';
import { ImageCropper } from 'src/layout/ImageUpload/ImageUpload';
import type { PropsFromGenericComponent } from 'src/layout';

export function ImageUploadComponent({ baseComponentId }: PropsFromGenericComponent<'ImageUpload'>) {
  const [croppedImage, setCroppedImage] = useState<string | null>(null);

  return (
    <ComponentStructureWrapper baseComponentId={baseComponentId}>
      <ImageCropper onCrop={setCroppedImage} />
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
