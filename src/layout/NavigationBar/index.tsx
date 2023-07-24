import React from 'react';

import { NavigationBarDef } from 'src/layout/NavigationBar/config.generated';
import { NavigationBarComponent } from 'src/layout/NavigationBar/NavigationBarComponent';
import type { ExprResolved } from 'src/features/expressions/types';
import type { PropsFromGenericComponent } from 'src/layout';
import type { ILayoutCompNavBar } from 'src/layout/NavigationBar/types';
import type { LayoutNode } from 'src/utils/layout/LayoutNode';

export class NavigationBar extends NavigationBarDef {
  render(props: PropsFromGenericComponent<'NavigationBar'>): JSX.Element | null {
    return <NavigationBarComponent {...props} />;
  }
}

export const Config = {
  def: new NavigationBar(),
  rendersWithLabel: false as const,
};

export type TypeConfig = {
  layout: ILayoutCompNavBar;
  nodeItem: ExprResolved<ILayoutCompNavBar>;
  nodeObj: LayoutNode;
  validTextResourceBindings: undefined;
  validDataModelBindings: undefined;
};
