import React from 'react';

import { useAppSelector } from 'src/common/hooks/useAppSelector';
import { FormComponent } from 'src/layout/LayoutComponent';
import { RadioButtonContainerComponent } from 'src/layout/RadioButtons/RadioButtonsContainerComponent';
import { useSelectedValueToText } from 'src/utils/formComponentUtils';
import type { PropsFromGenericComponent } from 'src/layout';
import type { SummaryRendererProps } from 'src/layout/LayoutComponent';
import type { LayoutNodeFromType } from 'src/utils/layout/hierarchy.types';

export class RadioButtons extends FormComponent<'RadioButtons'> {
  render(props: PropsFromGenericComponent<'RadioButtons'>): JSX.Element | null {
    return <RadioButtonContainerComponent {...props} />;
  }

  renderWithLabel(): boolean {
    return false;
  }

  useDisplayData(node: LayoutNodeFromType<'RadioButtons'>): string {
    const formData = useAppSelector((state) => state.formData.formData);
    const value = node.item.dataModelBindings?.simpleBinding
      ? formData[node.item.dataModelBindings.simpleBinding] || ''
      : '';
    return useSelectedValueToText(node.item, value) || '';
  }

  renderSummary(_props: SummaryRendererProps<'RadioButtons'>): JSX.Element | null {
    // PRIORITY: Implement
    return <span>Nothing implemented yet</span>;
  }
}
