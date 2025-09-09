import React from 'react';

import { ComponentStructureWrapper } from 'src/layout/ComponentStructureWrapper';
import { ImageCropper } from 'src/layout/ImageUpload/ImageUpload';
import { getCropArea } from 'src/layout/ImageUpload/imageUploadUtils';
import { useItemWhenType } from 'src/utils/layout/useNodeItem';
import type { PropsFromGenericComponent } from 'src/layout';
import type { CropArea } from 'src/layout/ImageUpload/imageUploadUtils';

export function ImageUploadComponent({ baseComponentId }: PropsFromGenericComponent<'ImageUpload'>) {
  const { cropArea } = useItemWhenType(baseComponentId, 'ImageUpload');

  return (
    <ComponentStructureWrapper baseComponentId={baseComponentId}>
      <ImageCropper
        cropArea={getCropArea(cropArea as CropArea)}
        baseComponentId={baseComponentId}
      />
    </ComponentStructureWrapper>
  );
}
