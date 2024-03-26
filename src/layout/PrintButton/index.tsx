import React, { forwardRef } from 'react';

import type { PropsFromGenericComponent } from '..';

import { PrintButtonDef } from 'src/layout/PrintButton/config.def.generated';
import { PrintButtonComponent } from 'src/layout/PrintButton/PrintButtonComponent';
import type { ExprResolver } from 'src/layout/LayoutComponent';

export class PrintButton extends PrintButtonDef {
  render = forwardRef<HTMLElement, PropsFromGenericComponent<'PrintButton'>>(
    function LayoutComponentPrintRender(props, _): JSX.Element | null {
      return <PrintButtonComponent {...props} />;
    },
  );

  evalExpressions({ item, evalTrb, evalCommon }: ExprResolver<'PrintButton'>) {
    return {
      ...item,
      ...evalCommon(),
      ...evalTrb(),
    };
  }
}
