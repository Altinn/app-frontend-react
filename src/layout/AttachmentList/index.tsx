import React, { forwardRef } from 'react';

import { AttachmentListComponent } from 'src/layout/AttachmentList/AttachmentListComponent';
import { AttachmentListDef } from 'src/layout/AttachmentList/config.def.generated';
import type { PropsFromGenericComponent } from 'src/layout';
import type { CompInternal } from 'src/layout/layout';
import type { ExprResolver } from 'src/layout/LayoutComponent';

export class AttachmentList extends AttachmentListDef {
  render = forwardRef<HTMLElement, PropsFromGenericComponent<'AttachmentList'>>(
    function LayoutComponentAttachmentListRender(props, _): JSX.Element | null {
      return <AttachmentListComponent {...props} />;
    },
  );

  evalExpressions({ item, evalTrb, evalCommon }: ExprResolver<'AttachmentList'>): CompInternal<'AttachmentList'> {
    return {
      ...item,
      ...evalCommon(item),
      ...evalTrb(item),
    };
  }
}
