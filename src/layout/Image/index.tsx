import React, { forwardRef } from 'react';

import { ImageDef } from 'src/layout/Image/config.def.generated';
import { ImageComponent } from 'src/layout/Image/ImageComponent';
import type { PropsFromGenericComponent } from 'src/layout';

export class Image extends ImageDef {
  // eslint-disable-next-line react/display-name
  render = forwardRef<HTMLElement, PropsFromGenericComponent<'Image'>>((props, _): JSX.Element | null => (
    <ImageComponent {...props} />
  ));
}
