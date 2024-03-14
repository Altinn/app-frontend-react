import React, { forwardRef } from 'react';

import { InstantiationButtonDef } from 'src/layout/InstantiationButton/config.def.generated';
import { InstantiationButtonComponent } from 'src/layout/InstantiationButton/InstantiationButtonComponent';
import type { PropsFromGenericComponent } from 'src/layout';
import type { CompInternal } from 'src/layout/layout';
import type { ExprResolver } from 'src/layout/LayoutComponent';

export class InstantiationButton extends InstantiationButtonDef {
  render = forwardRef<HTMLElement, PropsFromGenericComponent<'InstantiationButton'>>(
    function LayoutComponentInstantiationButtonRender(props, _): JSX.Element | null {
      return <InstantiationButtonComponent {...props} />;
    },
  );

  evalExpressions({
    item,
    evalTrb,
    evalCommon,
  }: ExprResolver<'InstantiationButton'>): CompInternal<'InstantiationButton'> {
    return {
      ...item,
      ...evalCommon(item),
      ...evalTrb(item),
    };
  }
}
