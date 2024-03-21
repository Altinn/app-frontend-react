import React, { forwardRef } from 'react';

import { ImageDef } from 'src/layout/Image/config.def.generated';
import { ImageComponent } from 'src/layout/Image/ImageComponent';
import type { PropsFromGenericComponent } from 'src/layout';
import type { ExprResolver } from 'src/layout/LayoutComponent';

export class Image extends ImageDef {
  render = forwardRef<HTMLElement, PropsFromGenericComponent<'Image'>>(
    function LayoutComponentImageRender(props, _): JSX.Element | null {
      return <ImageComponent {...props} />;
    },
  );

  evalExpressions({ item, evalTrb, evalCommon }: ExprResolver<'Image'>) {
    return {
      ...item,
      ...evalCommon(),
      ...evalTrb(),
    };
  }
}
