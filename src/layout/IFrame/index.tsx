import React, { forwardRef } from 'react';

import { IFrameDef } from 'src/layout/IFrame/config.def.generated';
import { IFrameComponent } from 'src/layout/IFrame/IFrameComponent';
import type { IFrameComponentProps } from 'src/layout/IFrame/IFrameComponent';
import type { ExprResolver } from 'src/layout/LayoutComponent';

export class IFrame extends IFrameDef {
  render = forwardRef<HTMLElement, IFrameComponentProps>(
    function LayoutComponentIFrameRender(props, _): JSX.Element | null {
      return <IFrameComponent {...props} />;
    },
  );

  evalExpressions({ item, evalTrb, evalCommon }: ExprResolver<'IFrame'>) {
    return {
      ...item,
      ...evalCommon(),
      ...evalTrb(),
    };
  }
}
