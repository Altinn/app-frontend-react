import React from 'react';

import { ButtonComponent } from 'src/layout/Button/ButtonComponent';
import { ActionComponent } from 'src/layout/LayoutComponent';
import type { ExprResolved } from 'src/features/expressions/types';
import type { PropsFromGenericComponent } from 'src/layout';
import type { ILayoutCompButton } from 'src/layout/Button/types';

export class Button extends ActionComponent<'Button'> {
  render(props: PropsFromGenericComponent<'Button'>): JSX.Element | null {
    return <ButtonComponent {...props} />;
  }

  canRenderInButtonGroup(): boolean {
    return true;
  }

  renderWithLabel(): boolean {
    return false;
  }
}

export const Config = {
  def: new Button(),
  types: {
    layout: {} as unknown as ILayoutCompButton,
    node: {} as unknown as ExprResolved<ILayoutCompButton>,
  },
};
