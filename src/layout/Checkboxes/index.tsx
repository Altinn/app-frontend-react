import React from 'react';

import { useAppSelector } from 'src/common/hooks/useAppSelector';
import { CheckboxContainerComponent } from 'src/layout/Checkboxes/CheckboxesContainerComponent';
import { FormComponent } from 'src/layout/LayoutComponent';
import { useCommaSeparatedOptionsToText } from 'src/utils/formComponentUtils';
import type { PropsFromGenericComponent } from 'src/layout';
import type { SummaryRendererProps } from 'src/layout/LayoutComponent';
import type { LayoutNodeFromType } from 'src/utils/layout/hierarchy.types';

export class Checkboxes extends FormComponent<'Checkboxes'> {
  render(props: PropsFromGenericComponent<'Checkboxes'>): JSX.Element | null {
    return <CheckboxContainerComponent {...props} />;
  }

  renderWithLabel(): boolean {
    return false;
  }

  private useSummaryData(node: LayoutNodeFromType<'Checkboxes'>): { [key: string]: string } {
    const formData = useAppSelector((state) => state.formData.formData);
    const value = node.item.dataModelBindings?.simpleBinding
      ? formData[node.item.dataModelBindings.simpleBinding] || ''
      : '';
    return useCommaSeparatedOptionsToText(node.item, value);
  }

  useDisplayData(node: LayoutNodeFromType<'Checkboxes'>): string {
    return Object.values(this.useSummaryData(node)).join(', ');
  }

  renderSummary(_props: SummaryRendererProps<'Checkboxes'>): JSX.Element | null {
    return <span>Not implemented</span>;
  }
}
