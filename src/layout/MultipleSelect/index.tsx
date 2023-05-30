import React from 'react';

import { useAppSelector } from 'src/hooks/useAppSelector';
import { useCommaSeparatedOptionsToText } from 'src/hooks/useCommaSeparatedOptionsToText';
import { MultipleChoiceSummary } from 'src/layout/Checkboxes/MultipleChoiceSummary';
import { FormComponent } from 'src/layout/LayoutComponent';
import { MultipleSelectComponent } from 'src/layout/MultipleSelect/MultipleSelectComponent';
import { LayoutNode } from 'src/utils/layout/LayoutNode';
import type { ExprResolved } from 'src/features/expressions/types';
import type { PropsFromGenericComponent } from 'src/layout';
import type { SummaryRendererProps } from 'src/layout/LayoutComponent';
import type { ILayoutCompMultipleSelect } from 'src/layout/MultipleSelect/types';
import type { LayoutNodeFromType } from 'src/utils/layout/hierarchy.types';

export class MultipleSelect extends FormComponent<'MultipleSelect'> {
  render(props: PropsFromGenericComponent<'MultipleSelect'>): JSX.Element | null {
    return <MultipleSelectComponent {...props} />;
  }

  private useSummaryData(node: LayoutNodeFromType<'MultipleSelect'>): { [key: string]: string } {
    const formData = useAppSelector((state) => state.formData.formData);
    if (!node.item.dataModelBindings?.simpleBinding) {
      return {};
    }

    const value = formData[node.item.dataModelBindings.simpleBinding] || '';
    return useCommaSeparatedOptionsToText(node.item, value);
  }

  useDisplayData(node: LayoutNodeFromType<'MultipleSelect'>): string {
    return Object.values(this.useSummaryData(node)).join(', ');
  }

  renderSummary({ targetNode }: SummaryRendererProps<'MultipleSelect'>): JSX.Element | null {
    const formData = this.useSummaryData(targetNode);
    return <MultipleChoiceSummary formData={formData} />;
  }
}

export const Config = {
  def: new MultipleSelect(),
  types: {
    layout: {} as unknown as ILayoutCompMultipleSelect,
    nodeItem: {} as unknown as ExprResolved<ILayoutCompMultipleSelect>,
    nodeObj: LayoutNode,
  },
};
