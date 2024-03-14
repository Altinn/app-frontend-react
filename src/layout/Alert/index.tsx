import React, { forwardRef } from 'react';

import { Alert as AlertComponent } from 'src/layout/Alert/Alert';
import { AlertDef } from 'src/layout/Alert/config.def.generated';
import type { PropsFromGenericComponent } from 'src/layout';
import type { CompInternal } from 'src/layout/layout';
import type { ExprResolver } from 'src/layout/LayoutComponent';

export class Alert extends AlertDef {
  render = forwardRef<HTMLElement, PropsFromGenericComponent<'Alert'>>(
    function LayoutComponentAlertRender(props, _): JSX.Element | null {
      return <AlertComponent {...props} />;
    },
  );

  evalExpressions({ item, evalTrb, evalCommon }: ExprResolver<'Alert'>): CompInternal<'Alert'> {
    return {
      ...item,
      ...evalCommon(item),
      ...evalTrb(item),
    };
  }
}
