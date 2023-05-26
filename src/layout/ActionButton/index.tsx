import React from 'react';

import { ActionButtonComponent } from 'src/layout/ActionButton/ActionButtonComponent';
import { ActionComponent } from 'src/layout/LayoutComponent';
import type { ExprResolved } from 'src/features/expressions/types';
import type { PropsFromGenericComponent } from 'src/layout';
import type { ILayoutCompActionButton } from 'src/layout/ActionButton/types';

export class ActionButton extends ActionComponent<'ActionButton'> {
  render(props: PropsFromGenericComponent<'ActionButton'>): JSX.Element | null {
    return <ActionButtonComponent {...props} />;
  }

  canRenderInButtonGroup(): boolean {
    return true;
  }

  renderWithLabel(): boolean {
    return false;
  }
}

export const Config = {
  def: new ActionButton(),
  types: {
    layout: {} as unknown as ILayoutCompActionButton,
    node: {} as unknown as ExprResolved<ILayoutCompActionButton>,
  },
};
