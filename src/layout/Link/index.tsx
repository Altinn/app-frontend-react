import React, { forwardRef } from 'react';

import type { PropsFromGenericComponent } from '..';

import { LinkDef } from 'src/layout/Link/config.def.generated';
import { LinkComponent } from 'src/layout/Link/LinkComponent';
import type { ExprResolver, StoreFactoryProps } from 'src/layout/LayoutComponent';

export class Link extends LinkDef {
  render = forwardRef<HTMLElement, PropsFromGenericComponent<'Link'>>(
    function LayoutComponentLinkRender(props, _): JSX.Element | null {
      return <LinkComponent {...props} />;
    },
  );

  storeFactory(props: StoreFactoryProps<'Link'>) {
    return this.defaultStoreFactory(props);
  }

  evalExpressions({ item, evalTrb, evalCommon }: ExprResolver<'Link'>) {
    return {
      ...item,
      ...evalCommon(),
      ...evalTrb(),
    };
  }
}
