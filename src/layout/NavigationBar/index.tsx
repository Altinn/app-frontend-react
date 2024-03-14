import React, { forwardRef } from 'react';

import { NavigationBarDef } from 'src/layout/NavigationBar/config.def.generated';
import { NavigationBarComponent } from 'src/layout/NavigationBar/NavigationBarComponent';
import type { PropsFromGenericComponent } from 'src/layout';
import type { CompInternal } from 'src/layout/layout';
import type { ExprResolver } from 'src/layout/LayoutComponent';

export class NavigationBar extends NavigationBarDef {
  render = forwardRef<HTMLElement, PropsFromGenericComponent<'NavigationBar'>>(
    function LayoutComponentNavigationBarRender(props, _): JSX.Element | null {
      return <NavigationBarComponent {...props} />;
    },
  );

  evalExpressions({ item, evalTrb, evalCommon }: ExprResolver<'NavigationBar'>): CompInternal<'NavigationBar'> {
    return {
      ...item,
      ...evalCommon(item),
      ...evalTrb(item),
    };
  }
}
