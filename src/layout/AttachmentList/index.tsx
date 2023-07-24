import React from 'react';

import { AttachmentListComponent } from 'src/layout/AttachmentList/AttachmentListComponent';
import { AttachmentListDef } from 'src/layout/AttachmentList/config.generated';
import type { ExprResolved } from 'src/features/expressions/types';
import type { PropsFromGenericComponent } from 'src/layout';
import type { ILayoutCompAttachmentList } from 'src/layout/AttachmentList/types';
import type { LayoutNode } from 'src/utils/layout/LayoutNode';

export class AttachmentList extends AttachmentListDef {
  render(props: PropsFromGenericComponent<'AttachmentList'>): JSX.Element | null {
    return <AttachmentListComponent {...props} />;
  }
}

export const Config = {
  def: new AttachmentList(),
  rendersWithLabel: false as const,
};

export type TypeConfig = {
  layout: ILayoutCompAttachmentList;
  nodeItem: ExprResolved<ILayoutCompAttachmentList>;
  nodeObj: LayoutNode;
  validTextResourceBindings: 'title';
  validDataModelBindings: undefined;
};
