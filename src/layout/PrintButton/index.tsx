import React from 'react';

import type { PropsFromGenericComponent } from '..';

import { ActionComponent } from 'src/layout/LayoutComponent';
import { PrintButtonComponent } from 'src/layout/PrintButton/PrintButtonComponent';
import type { ExprResolved } from 'src/features/expressions/types';
import type { ILayoutCompPrintButton } from 'src/layout/PrintButton/types';

export class PrintButton extends ActionComponent<'PrintButton'> {
  render(props: PropsFromGenericComponent<'PrintButton'>): JSX.Element | null {
    return <PrintButtonComponent {...props} />;
  }

  canRenderInButtonGroup(): boolean {
    return true;
  }

  renderWithLabel(): boolean {
    return false;
  }
}

export const Config = {
  def: new PrintButton(),
  types: {
    layout: {} as unknown as ILayoutCompPrintButton,
    node: {} as unknown as ExprResolved<ILayoutCompPrintButton>,
  },
};
