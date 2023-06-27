import React from 'react';

import { Alert as AlertComponent } from 'src/layout/Alert/Alert';
import { PresentationComponent } from 'src/layout/LayoutComponent';
import type { ExprResolved } from 'src/features/expressions/types';
import type { PropsFromGenericComponent } from 'src/layout';
import type { ILayoutCompAlert } from 'src/layout/Alert/types';
import type { LayoutNode } from 'src/utils/layout/LayoutNode';

export class Alert extends PresentationComponent<'Alert'> {
  render(props: PropsFromGenericComponent<'Alert'>): JSX.Element | null {
    return <AlertComponent {...props} />;
  }

  renderWithLabel(): boolean {
    return false;
  }

  canRenderInTable(): boolean {
    return false;
  }
}

export const Config = {
  def: new Alert(),
};

export type TypeConfig = {
  layout: ILayoutCompAlert;
  nodeItem: ExprResolved<ILayoutCompAlert>;
  nodeObj: LayoutNode;
};
