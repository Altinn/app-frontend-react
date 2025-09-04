import React from 'react';

import { ComponentStructureWrapper } from 'src/layout/ComponentStructureWrapper';
import { ImageProvider } from 'src/layout/ImageUpload/ImageContext';
import { ImageCropper } from 'src/layout/ImageUpload/ImageUpload';
import type { PropsFromGenericComponent } from 'src/layout';

export function ImageUploadComponent({ baseComponentId }: PropsFromGenericComponent<'ImageUpload'>) {
  return (
    <ComponentStructureWrapper baseComponentId={baseComponentId}>
      <ImageProvider baseComponentId={baseComponentId}>
        <ImageCropper />
      </ImageProvider>
    </ComponentStructureWrapper>
  );
}
