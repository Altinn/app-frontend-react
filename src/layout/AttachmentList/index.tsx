import React, { forwardRef } from 'react';

import { AttachmentListComponent } from 'src/layout/AttachmentList/AttachmentListComponent';
import { AttachmentListDef } from 'src/layout/AttachmentList/config.def.generated';
import type { PropsFromGenericComponent } from 'src/layout';

export class AttachmentList extends AttachmentListDef {
  // eslint-disable-next-line react/display-name
  render = forwardRef<HTMLElement, PropsFromGenericComponent<'AttachmentList'>>((props, _): JSX.Element | null => (
    <AttachmentListComponent {...props} />
  ));
}
