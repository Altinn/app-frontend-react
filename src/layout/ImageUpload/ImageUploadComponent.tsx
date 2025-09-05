import React from 'react';

import { ComponentStructureWrapper } from 'src/layout/ComponentStructureWrapper';
import { ImageCropper } from 'src/layout/ImageUpload/ImageUpload';
import { useItemWhenType } from 'src/utils/layout/useNodeItem';
import type { PropsFromGenericComponent } from 'src/layout';
import type { ViewportType } from 'src/layout/ImageUpload/imageUploadUtils';

export function ImageUploadComponent({ baseComponentId }: PropsFromGenericComponent<'ImageUpload'>) {
  const { viewport } = useItemWhenType(baseComponentId, 'ImageUpload');

  return (
    <ComponentStructureWrapper baseComponentId={baseComponentId}>
      <ImageCropper
        viewport={viewport as ViewportType}
        baseComponentId={baseComponentId}
      />
    </ComponentStructureWrapper>
  );
}
