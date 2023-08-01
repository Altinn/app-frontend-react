import React from 'react';

import { Alert as AlertComponent } from 'src/layout/Alert/Alert';
import { AlertDef } from 'src/layout/Alert/config.generated';
import type { ExprResolved } from 'src/features/expressions/types';
import type { PropsFromGenericComponent } from 'src/layout';
import type { ILayoutCompAlert } from 'src/layout/Alert/types';
import type { LayoutNode } from 'src/utils/layout/LayoutNode';

export class Alert extends AlertDef {
  render(props: PropsFromGenericComponent<'Alert'>): JSX.Element | null {
    return <AlertComponent {...props} />;
  }
}

export const Config = {
  def: new Alert(),
  rendersWithLabel: false as const,
};

export type TypeConfig = {
  layout: ILayoutCompAlert;
  nodeItem: ExprResolved<ILayoutCompAlert>;
  nodeObj: LayoutNode;
  validTextResourceBindings: 'title' | 'description';
  validDataModelBindings: undefined;
};
