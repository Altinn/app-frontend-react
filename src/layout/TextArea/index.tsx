import React from 'react';

import { FD } from 'src/features/formData2/Compatibility';
import { FormComponent } from 'src/layout/LayoutComponent';
import { SummaryItemSimple } from 'src/layout/Summary/SummaryItemSimple';
import { TextAreaComponent } from 'src/layout/TextArea/TextAreaComponent';
import type { ExprResolved } from 'src/features/expressions/types';
import type { PropsFromGenericComponent } from 'src/layout';
import type { SummaryRendererProps } from 'src/layout/LayoutComponent';
import type { ILayoutCompTextArea } from 'src/layout/TextArea/types';
import type { LayoutNodeFromType } from 'src/utils/layout/hierarchy.types';
import type { LayoutNode } from 'src/utils/layout/LayoutNode';

export class TextArea extends FormComponent<'TextArea'> {
  render(props: PropsFromGenericComponent<'TextArea'>): JSX.Element | null {
    return <TextAreaComponent {...props} />;
  }

  useDisplayData(node: LayoutNodeFromType<'TextArea'>): string {
    const value = FD.usePick(node.item.dataModelBindings?.simpleBinding);
    return typeof value === 'string' ? value : '';
  }

  renderSummary({ targetNode }: SummaryRendererProps<'TextArea'>): JSX.Element | null {
    const displayData = this.useDisplayData(targetNode);
    return <SummaryItemSimple formDataAsString={displayData} />;
  }
}

export const Config = {
  def: new TextArea(),
};

export type TypeConfig = {
  layout: ILayoutCompTextArea;
  nodeItem: ExprResolved<ILayoutCompTextArea>;
  nodeObj: LayoutNode;
};
