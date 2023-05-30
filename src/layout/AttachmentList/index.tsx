import React from 'react';

import { AttachmentListComponent } from 'src/layout/AttachmentList/AttachmentListComponent';
import { PresentationComponent } from 'src/layout/LayoutComponent';
import { LayoutNode } from 'src/utils/layout/LayoutNode';
import type { ExprResolved } from 'src/features/expressions/types';
import type { PropsFromGenericComponent } from 'src/layout';
import type { ILayoutCompAttachmentList } from 'src/layout/AttachmentList/types';

export class AttachmentList extends PresentationComponent<'AttachmentList'> {
  render(props: PropsFromGenericComponent<'AttachmentList'>): JSX.Element | null {
    return <AttachmentListComponent {...props} />;
  }

  renderWithLabel(): boolean {
    return false;
  }

  canRenderInTable(): boolean {
    return false;
  }
}

export const Config = {
  def: new AttachmentList(),
  types: {
    layout: {} as unknown as ILayoutCompAttachmentList,
    nodeItem: {} as unknown as ExprResolved<ILayoutCompAttachmentList>,
    nodeObj: LayoutNode,
  },
};
