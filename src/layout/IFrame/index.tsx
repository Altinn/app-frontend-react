import React from 'react';

import { IFrameComponent } from 'src/layout/IFrame/IFrameComponent';
import { PresentationComponent } from 'src/layout/LayoutComponent';
import { LayoutNode } from 'src/utils/layout/LayoutNode';
import type { ExprResolved } from 'src/features/expressions/types';
import type { IFrameComponentProps } from 'src/layout/IFrame/IFrameComponent';
import type { ILayoutCompIFrame } from 'src/layout/IFrame/types';

export class IFrame extends PresentationComponent<'IFrame'> {
  render(props: IFrameComponentProps): JSX.Element | null {
    return <IFrameComponent {...props} />;
  }

  renderWithLabel(): boolean {
    return false;
  }
}

export const Config = {
  def: new IFrame(),
  types: {
    layout: {} as unknown as ILayoutCompIFrame,
    nodeItem: {} as unknown as ExprResolved<ILayoutCompIFrame>,
    nodeObj: LayoutNode,
  },
};
