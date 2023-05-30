import React from 'react';

import { InstantiationButtonComponent } from 'src/layout/InstantiationButton/InstantiationButtonComponent';
import { ActionComponent } from 'src/layout/LayoutComponent';
import { LayoutNode } from 'src/utils/layout/LayoutNode';
import type { ExprResolved } from 'src/features/expressions/types';
import type { PropsFromGenericComponent } from 'src/layout';
import type { ILayoutCompInstantiationButton } from 'src/layout/InstantiationButton/types';

export class InstantiationButton extends ActionComponent<'InstantiationButton'> {
  render(props: PropsFromGenericComponent<'InstantiationButton'>): JSX.Element | null {
    return <InstantiationButtonComponent {...props} />;
  }

  canRenderInButtonGroup(): boolean {
    return true;
  }

  renderWithLabel(): boolean {
    return false;
  }
}

export const Config = {
  def: new InstantiationButton(),
  types: {
    layout: {} as unknown as ILayoutCompInstantiationButton,
    nodeItem: {} as unknown as ExprResolved<ILayoutCompInstantiationButton>,
    nodeObj: LayoutNode,
  },
};
