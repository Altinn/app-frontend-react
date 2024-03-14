import React, { forwardRef } from 'react';

import { ActionButtonComponent } from 'src/layout/ActionButton/ActionButtonComponent';
import { ActionButtonDef } from 'src/layout/ActionButton/config.def.generated';
import type { PropsFromGenericComponent } from 'src/layout';
import type { CompInternal } from 'src/layout/layout';
import type { ExprResolver } from 'src/layout/LayoutComponent';

export class ActionButton extends ActionButtonDef {
  render = forwardRef<HTMLElement, PropsFromGenericComponent<'ActionButton'>>(
    function LayoutComponentActionButtonRender(props, _): JSX.Element | null {
      return <ActionButtonComponent {...props} />;
    },
  );

  evalExpressions({ item, evalTrb, evalCommon }: ExprResolver<'ActionButton'>): CompInternal<'ActionButton'> {
    return {
      ...item,
      ...evalCommon(item),
      ...evalTrb(item),
    };
  }
}
