import React from 'react';

import { useAppSelector } from 'src/hooks/useAppSelector';
import { useSelectedValueToText } from 'src/hooks/useSelectedValueToText';
import { FormComponent } from 'src/layout/LayoutComponent';
import { RadioButtonContainerComponent } from 'src/layout/RadioButtons/RadioButtonsContainerComponent';
import { SummaryItemSimple } from 'src/layout/Summary/SummaryItemSimple';
import type { ExprResolved } from 'src/features/expressions/types';
import type { PropsFromGenericComponent } from 'src/layout';
import type { SummaryRendererProps } from 'src/layout/LayoutComponent';
import type { ILayoutCompRadioButtons } from 'src/layout/RadioButtons/types';
import type { LayoutNodeFromType } from 'src/utils/layout/hierarchy.types';
import type { LayoutNode } from 'src/utils/layout/LayoutNode';

export class RadioButtons extends FormComponent<'RadioButtons'> {
  render(props: PropsFromGenericComponent<'RadioButtons'>): JSX.Element | null {
    return <RadioButtonContainerComponent {...props} />;
  }

  renderWithLabel(): boolean {
    return false;
  }

  useDisplayData(node: LayoutNodeFromType<'RadioButtons'>): string {
    const formData = useAppSelector((state) => state.formData.formData);
    const value = node.dataModelBindings?.simpleBinding ? formData[node.dataModelBindings.simpleBinding] || '' : '';
    return useSelectedValueToText(node.item, value) || '';
  }

  renderSummary({ targetNode }: SummaryRendererProps<'RadioButtons'>): JSX.Element | null {
    const displayData = this.useDisplayData(targetNode);
    return <SummaryItemSimple formDataAsString={displayData} />;
  }
}

export const Config = {
  def: new RadioButtons(),
};

export type TypeConfig = {
  layout: ILayoutCompRadioButtons;
  nodeItem: ExprResolved<ILayoutCompRadioButtons>;
  nodeObj: LayoutNode;
};
