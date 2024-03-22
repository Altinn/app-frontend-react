import React, { forwardRef } from 'react';

import { AttachmentListComponent } from 'src/layout/AttachmentList/AttachmentListComponent';
import { AttachmentListDef } from 'src/layout/AttachmentList/config.def.generated';
import type { PropsFromGenericComponent } from 'src/layout';
import type { ExprResolver, StoreFactoryProps } from 'src/layout/LayoutComponent';

export class AttachmentList extends AttachmentListDef {
  render = forwardRef<HTMLElement, PropsFromGenericComponent<'AttachmentList'>>(
    function LayoutComponentAttachmentListRender(props, _): JSX.Element | null {
      return <AttachmentListComponent {...props} />;
    },
  );

  storeFactory(props: StoreFactoryProps<'AttachmentList'>) {
    return this.defaultStoreFactory(props);
  }

  evalExpressions({ item, evalTrb, evalCommon }: ExprResolver<'AttachmentList'>) {
    return {
      ...item,
      ...evalCommon(),
      ...evalTrb(),
    };
  }
}
