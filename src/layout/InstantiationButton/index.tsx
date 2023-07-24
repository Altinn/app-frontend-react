import React from 'react';

import { InstantiationButtonDef } from 'src/layout/InstantiationButton/config.generated';
import { InstantiationButtonComponent } from 'src/layout/InstantiationButton/InstantiationButtonComponent';
import type { ExprResolved } from 'src/features/expressions/types';
import type { PropsFromGenericComponent } from 'src/layout';
import type { ILayoutCompInstantiationButton } from 'src/layout/InstantiationButton/types';
import type { LayoutNode } from 'src/utils/layout/LayoutNode';

export class InstantiationButton extends InstantiationButtonDef {
  render(props: PropsFromGenericComponent<'InstantiationButton'>): JSX.Element | null {
    return <InstantiationButtonComponent {...props} />;
  }
}

export const Config = {
  def: new InstantiationButton(),
  rendersWithLabel: false as const,
};

export type TypeConfig = {
  layout: ILayoutCompInstantiationButton;
  nodeItem: ExprResolved<ILayoutCompInstantiationButton>;
  nodeObj: LayoutNode;
  validTextResourceBindings: 'title';
  validDataModelBindings: undefined;
};
