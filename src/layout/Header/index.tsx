import React, { forwardRef } from 'react';

import { HeaderDef } from 'src/layout/Header/config.def.generated';
import { HeaderComponent } from 'src/layout/Header/HeaderComponent';
import type { PropsFromGenericComponent } from 'src/layout';
import type { ExprResolver } from 'src/layout/LayoutComponent';

export class Header extends HeaderDef {
  render = forwardRef<HTMLElement, PropsFromGenericComponent<'Header'>>(
    function LayoutComponentHeaderRender(props, _): JSX.Element | null {
      return <HeaderComponent {...props} />;
    },
  );

  evalExpressions({ item, evalTrb, evalCommon }: ExprResolver<'Header'>) {
    return {
      ...item,
      ...evalCommon(),
      ...evalTrb(),
    };
  }
}
