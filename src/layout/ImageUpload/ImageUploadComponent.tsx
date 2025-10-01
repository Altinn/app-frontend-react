import React from 'react';

import { Label } from 'src/app-components/Label/Label';
import { ComponentStructureWrapper } from 'src/layout/ComponentStructureWrapper';
import { ImageCropper } from 'src/layout/ImageUpload/ImageCropper';
import { getCropArea } from 'src/layout/ImageUpload/imageUploadUtils';
import { useLabel } from 'src/utils/layout/useLabel';
import { useItemWhenType } from 'src/utils/layout/useNodeItem';
import type { PropsFromGenericComponent } from 'src/layout';
import type { CropArea } from 'src/layout/ImageUpload/imageUploadUtils';

export function ImageUploadComponent({ baseComponentId, overrideDisplay }: PropsFromGenericComponent<'ImageUpload'>) {
  const { id, cropHeight, cropShape, cropWidth, grid, required } = useItemWhenType(baseComponentId, 'ImageUpload');
  const { labelText, getRequiredComponent, getOptionalComponent, getHelpTextComponent, getDescriptionComponent } =
    useLabel({ baseComponentId, overrideDisplay });

  return (
    <Label
      htmlFor={id}
      label={labelText}
      grid={grid?.labelGrid}
      required={required}
      requiredIndicator={getRequiredComponent()}
      optionalIndicator={getOptionalComponent()}
      help={getHelpTextComponent()}
      description={getDescriptionComponent()}
    >
      <ComponentStructureWrapper baseComponentId={baseComponentId}>
        <ImageCropper
          cropArea={getCropArea({ width: cropWidth, height: cropHeight, type: cropShape } as CropArea)}
          baseComponentId={baseComponentId}
        />
      </ComponentStructureWrapper>
    </Label>
  );
}
