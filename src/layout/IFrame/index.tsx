import React from 'react';

import { IFrameComponent } from 'src/layout/IFrame/IFrameComponent';
import { PresentationComponent } from 'src/layout/LayoutComponent';
import type { IFrameComponentProps } from 'src/layout/IFrame/IFrameComponent';

export class IFrame extends PresentationComponent<'IFrame'> {
  render(props: IFrameComponentProps): JSX.Element | null {
    return <IFrameComponent {...props} />;
  }

  renderWithLabel(): boolean {
    return false;
  }
}
