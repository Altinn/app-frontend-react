import React from 'react';

import { IFrameDef } from 'src/layout/IFrame/config.generated';
import { IFrameComponent } from 'src/layout/IFrame/IFrameComponent';
import type { ExprResolved } from 'src/features/expressions/types';
import type { IFrameComponentProps } from 'src/layout/IFrame/IFrameComponent';
import type { ILayoutCompIFrame } from 'src/layout/IFrame/types';
import type { LayoutNode } from 'src/utils/layout/LayoutNode';

export class IFrame extends IFrameDef {
  render(props: IFrameComponentProps): JSX.Element | null {
    return <IFrameComponent {...props} />;
  }
}

export const Config = {
  def: new IFrame(),
  rendersWithLabel: false as const,
};

export type TypeConfig = {
  layout: ILayoutCompIFrame;
  nodeItem: ExprResolved<ILayoutCompIFrame>;
  nodeObj: LayoutNode;
  validTextResourceBindings: 'title';
  validDataModelBindings: undefined;
};
