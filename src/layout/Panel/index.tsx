import React, { forwardRef } from 'react';

import { PanelDef } from 'src/layout/Panel/config.def.generated';
import { PanelComponent } from 'src/layout/Panel/PanelComponent';
import type { PropsFromGenericComponent } from 'src/layout';
import type { ExprResolver } from 'src/layout/LayoutComponent';

export class Panel extends PanelDef {
  render = forwardRef<HTMLElement, PropsFromGenericComponent<'Panel'>>(
    function LayoutComponentPanelRender(props, _): JSX.Element | null {
      return <PanelComponent {...props} />;
    },
  );

  evalExpressions({ item, evalTrb, evalCommon }: ExprResolver<'Panel'>) {
    return {
      ...item,
      ...evalCommon(item),
      ...evalTrb(item),
    };
  }
}
