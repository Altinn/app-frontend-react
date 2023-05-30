import React from 'react';

import { useAppSelector } from 'src/hooks/useAppSelector';
import { FormComponent } from 'src/layout/LayoutComponent';
import { SummaryItemSimple } from 'src/layout/Summary/SummaryItemSimple';
import { TextAreaComponent } from 'src/layout/TextArea/TextAreaComponent';
import { LayoutNode } from 'src/utils/layout/LayoutNode';
import type { ExprResolved } from 'src/features/expressions/types';
import type { PropsFromGenericComponent } from 'src/layout';
import type { SummaryRendererProps } from 'src/layout/LayoutComponent';
import type { ILayoutCompTextArea } from 'src/layout/TextArea/types';
import type { LayoutNodeFromType } from 'src/utils/layout/hierarchy.types';

export class TextArea extends FormComponent<'TextArea'> {
  render(props: PropsFromGenericComponent<'TextArea'>): JSX.Element | null {
    return <TextAreaComponent {...props} />;
  }

  useDisplayData(node: LayoutNodeFromType<'TextArea'>): string {
    const formData = useAppSelector((state) => state.formData.formData);
    if (!node.item.dataModelBindings?.simpleBinding) {
      return '';
    }

    return formData[node.item.dataModelBindings.simpleBinding] || '';
  }

  renderSummary({ targetNode }: SummaryRendererProps<'TextArea'>): JSX.Element | null {
    const displayData = this.useDisplayData(targetNode);
    return <SummaryItemSimple formDataAsString={displayData} />;
  }
}

export const Config = {
  def: new TextArea(),
  types: {
    layout: {} as unknown as ILayoutCompTextArea,
    nodeItem: {} as unknown as ExprResolved<ILayoutCompTextArea>,
    nodeObj: LayoutNode,
  },
};
