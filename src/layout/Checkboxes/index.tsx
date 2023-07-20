import React from 'react';

import { useAppSelector } from 'src/hooks/useAppSelector';
import { useCommaSeparatedOptionsToText } from 'src/hooks/useCommaSeparatedOptionsToText';
import { CheckboxContainerComponent } from 'src/layout/Checkboxes/CheckboxesContainerComponent';
import { MultipleChoiceSummary } from 'src/layout/Checkboxes/MultipleChoiceSummary';
import { FormComponent } from 'src/layout/LayoutComponent';
import type { ExprResolved } from 'src/features/expressions/types';
import type { IFormData } from 'src/features/formData';
import type { PropsFromGenericComponent } from 'src/layout';
import type { ILayoutCompCheckboxes } from 'src/layout/Checkboxes/types';
import type { IDataModelBindingsSimple, TextBindingsForFormComponents, TextBindingsForLabel } from 'src/layout/layout';
import type { SummaryRendererProps } from 'src/layout/LayoutComponent';
import type { LayoutNodeFromType } from 'src/utils/layout/hierarchy.types';
import type { LayoutNode } from 'src/utils/layout/LayoutNode';

export class Checkboxes extends FormComponent<'Checkboxes'> {
  render(props: PropsFromGenericComponent<'Checkboxes'>): JSX.Element | null {
    return <CheckboxContainerComponent {...props} />;
  }

  private getSummaryData(node: LayoutNodeFromType<'Checkboxes'>, formData: IFormData): { [key: string]: string } {
    const value = node.item.dataModelBindings?.simpleBinding
      ? formData[node.item.dataModelBindings.simpleBinding] || ''
      : '';
    return useCommaSeparatedOptionsToText(node.item, value);
  }

  getDisplayData(node: LayoutNodeFromType<'Checkboxes'>, { formData }): string {
    return Object.values(this.getSummaryData(node, formData)).join(', ');
  }

  renderSummary({ targetNode }: SummaryRendererProps<'Checkboxes'>): JSX.Element | null {
    const formData = useAppSelector((state) => state.formData.formData);
    const summaryData = this.getSummaryData(targetNode, formData);
    return <MultipleChoiceSummary formData={summaryData} />;
  }
}

export const Config = {
  def: new Checkboxes(),
  rendersWithLabel: false as const,
};

export type TypeConfig = {
  layout: ILayoutCompCheckboxes;
  nodeItem: ExprResolved<ILayoutCompCheckboxes>;
  nodeObj: LayoutNode;
  // We don't render the label in GenericComponent, but we still need the
  // text resource bindings for rendering them on our own
  validTextResourceBindings: TextBindingsForLabel | TextBindingsForFormComponents;
  validDataModelBindings: IDataModelBindingsSimple;
};
