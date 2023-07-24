import React from 'react';

import { ActionButtonComponent } from 'src/layout/ActionButton/ActionButtonComponent';
import { ActionButtonDef } from 'src/layout/ActionButton/config.generated';
import type { ExprResolved } from 'src/features/expressions/types';
import type { PropsFromGenericComponent } from 'src/layout';
import type { ILayoutCompActionButton } from 'src/layout/ActionButton/types';
import type { LayoutNode } from 'src/utils/layout/LayoutNode';

export class ActionButton extends ActionButtonDef {
  render(props: PropsFromGenericComponent<'ActionButton'>): JSX.Element | null {
    return <ActionButtonComponent {...props} />;
  }
}

export const Config = {
  def: new ActionButton(),
  rendersWithLabel: false as const,
};

export type TypeConfig = {
  layout: ILayoutCompActionButton;
  nodeItem: ExprResolved<ILayoutCompActionButton>;
  nodeObj: LayoutNode;
  validTextResourceBindings: 'title';
  validDataModelBindings: undefined;
};
