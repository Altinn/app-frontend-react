import React, { forwardRef } from 'react';

import { IFrameDef } from 'src/layout/IFrame/config.def.generated';
import { IFrameComponent } from 'src/layout/IFrame/IFrameComponent';
import type { IFrameComponentProps } from 'src/layout/IFrame/IFrameComponent';

export class IFrame extends IFrameDef {
  // eslint-disable-next-line react/display-name
  render = forwardRef<HTMLElement, IFrameComponentProps>((props): JSX.Element | null => <IFrameComponent {...props} />);
}
