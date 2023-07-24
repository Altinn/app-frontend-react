import React from 'react';

import { PanelDef } from 'src/layout/Panel/config.generated';
import { PanelComponent } from 'src/layout/Panel/PanelComponent';
import type { ExprResolved } from 'src/features/expressions/types';
import type { PropsFromGenericComponent } from 'src/layout';
import type { ILayoutCompPanel } from 'src/layout/Panel/types';
import type { LayoutNode } from 'src/utils/layout/LayoutNode';

export class Panel extends PanelDef {
  render(props: PropsFromGenericComponent<'Panel'>): JSX.Element | null {
    return <PanelComponent {...props} />;
  }
}

export const Config = {
  def: new Panel(),
  rendersWithLabel: false as const,
};

export type TypeConfig = {
  layout: ILayoutCompPanel;
  nodeItem: ExprResolved<ILayoutCompPanel>;
  nodeObj: LayoutNode;
  validTextResourceBindings: 'title' | 'body';
  validDataModelBindings: undefined;
};
