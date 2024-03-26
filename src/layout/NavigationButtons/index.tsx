import React, { forwardRef } from 'react';

import { NavigationButtonsDef } from 'src/layout/NavigationButtons/config.def.generated';
import { NavigationButtonsComponent } from 'src/layout/NavigationButtons/NavigationButtonsComponent';
import type { PropsFromGenericComponent } from 'src/layout';
import type { ExprResolver } from 'src/layout/LayoutComponent';

export class NavigationButtons extends NavigationButtonsDef {
  render = forwardRef<HTMLElement, PropsFromGenericComponent<'NavigationButtons'>>(
    function LayoutComponentNavigationButtonRender(props, _): JSX.Element | null {
      return <NavigationButtonsComponent {...props} />;
    },
  );

  evalExpressions({ item, evalTrb, evalCommon }: ExprResolver<'NavigationButtons'>) {
    return {
      ...item,
      ...evalCommon(),
      ...evalTrb(),
    };
  }
}
