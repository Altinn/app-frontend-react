import React from 'react';

import type { PropsFromGenericComponent } from '..';

import { PrintButtonDef } from 'src/layout/PrintButton/config.generated';
import { PrintButtonComponent } from 'src/layout/PrintButton/PrintButtonComponent';
import type { ExprResolved } from 'src/features/expressions/types';
import type { ILayoutCompPrintButton } from 'src/layout/PrintButton/types';
import type { LayoutNode } from 'src/utils/layout/LayoutNode';

export class PrintButton extends PrintButtonDef {
  render(props: PropsFromGenericComponent<'PrintButton'>): JSX.Element | null {
    return <PrintButtonComponent {...props} />;
  }
}

export const Config = {
  def: new PrintButton(),
  rendersWithLabel: false as const,
};

export type TypeConfig = {
  layout: ILayoutCompPrintButton;
  nodeItem: ExprResolved<ILayoutCompPrintButton>;
  nodeObj: LayoutNode;
  validTextResourceBindings: 'title';
  validDataModelBindings: undefined;
};
