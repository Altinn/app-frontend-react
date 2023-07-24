import React from 'react';

import { ButtonComponent } from 'src/layout/Button/ButtonComponent';
import { ButtonDef } from 'src/layout/Button/config.generated';
import type { ExprResolved } from 'src/features/expressions/types';
import type { PropsFromGenericComponent } from 'src/layout';
import type { ILayoutCompButton } from 'src/layout/Button/types';
import type { LayoutNode } from 'src/utils/layout/LayoutNode';

export class Button extends ButtonDef {
  render(props: PropsFromGenericComponent<'Button'>): JSX.Element | null {
    return <ButtonComponent {...props} />;
  }
}

export const Config = {
  def: new Button(),
  rendersWithLabel: false as const,
};

export type TypeConfig = {
  layout: ILayoutCompButton;
  nodeItem: ExprResolved<ILayoutCompButton>;
  nodeObj: LayoutNode;
  validTextResourceBindings: 'title';
  validDataModelBindings: undefined;
};
