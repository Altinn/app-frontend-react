import React, { forwardRef } from 'react';

import { NavigationBarDef } from 'src/layout/NavigationBar/config.def.generated';
import { NavigationBarComponent } from 'src/layout/NavigationBar/NavigationBarComponent';
import type { PropsFromGenericComponent } from 'src/layout';
import type { ExprResolver, StoreFactoryProps } from 'src/layout/LayoutComponent';

export class NavigationBar extends NavigationBarDef {
  render = forwardRef<HTMLElement, PropsFromGenericComponent<'NavigationBar'>>(
    function LayoutComponentNavigationBarRender(props, _): JSX.Element | null {
      return <NavigationBarComponent {...props} />;
    },
  );

  storeFactory(props: StoreFactoryProps<'NavigationBar'>) {
    return this.defaultStoreFactory(props);
  }

  evalExpressions({ item, evalTrb, evalCommon }: ExprResolver<'NavigationBar'>) {
    return {
      ...item,
      ...evalCommon(),
      ...evalTrb(),
    };
  }
}
