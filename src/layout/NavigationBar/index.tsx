import React from 'react';

import { ActionComponent } from 'src/layout/LayoutComponent';
import { NavigationBarComponent } from 'src/layout/NavigationBar/NavigationBarComponent';
import type { ExprResolved } from 'src/features/expressions/types';
import type { PropsFromGenericComponent } from 'src/layout';
import type { ILayoutCompNavBar } from 'src/layout/NavigationBar/types';

export class NavigationBar extends ActionComponent<'NavigationBar'> {
  render(props: PropsFromGenericComponent<'NavigationBar'>): JSX.Element | null {
    return <NavigationBarComponent {...props} />;
  }

  renderWithLabel(): boolean {
    return false;
  }

  canRenderInTable(): boolean {
    return false;
  }
}

export const Config = {
  def: new NavigationBar(),
  types: {
    layout: {} as unknown as ILayoutCompNavBar,
    node: {} as unknown as ExprResolved<ILayoutCompNavBar>,
  },
};
