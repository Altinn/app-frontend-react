import React from 'react';

import { useAppSelector } from 'src/common/hooks/useAppSelector';
import { FormComponent } from 'src/layout/LayoutComponent';
import { MultipleSelectComponent } from 'src/layout/MultipleSelect/MultipleSelectComponent';
import { useCommaSeparatedOptionsToText } from 'src/utils/formComponentUtils';
import type { PropsFromGenericComponent } from 'src/layout';
import type { SummaryRendererProps } from 'src/layout/LayoutComponent';
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

  renderSummary(_props: SummaryRendererProps<'MultipleSelect'>): JSX.Element | null {
    // PRIORITY: Implement
    return <span>Nothing implemented yet</span>;
  }
}
