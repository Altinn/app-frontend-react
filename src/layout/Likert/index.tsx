import React from 'react';

import { getOptionList } from 'src/hooks/useOptionList';
import { getSelectedValueToText } from 'src/hooks/useSelectedValueToText';
import { LikertDef } from 'src/layout/Likert/config.def.generated';
import { LikertComponent } from 'src/layout/Likert/LikertComponent';
import { SummaryItemSimple } from 'src/layout/Summary/SummaryItemSimple';
import { LayoutStyle } from 'src/types';
import type { DisplayDataProps, PropsFromGenericComponent } from 'src/layout';
import type { SummaryRendererProps } from 'src/layout/LayoutComponent';
import type { LayoutNode } from 'src/utils/layout/LayoutNode';

export class Likert extends LikertDef {
  render(props: PropsFromGenericComponent<'Likert'>): JSX.Element | null {
    return <LikertComponent {...props} />;
  }

  directRender(props: PropsFromGenericComponent<'Likert'>): boolean {
    return props.node.item.layout === LayoutStyle.Table || props.overrideItemProps?.layout === LayoutStyle.Table;
  }

  getDisplayData(node: LayoutNode<'Likert'>, { formData, langTools, uiConfig, options }: DisplayDataProps): string {
    if (!node.item.dataModelBindings?.simpleBinding) {
      return '';
    }

    const value = formData[node.item.dataModelBindings.simpleBinding] || '';
    const optionList = getOptionList(node.item, langTools.textResources, formData, uiConfig.repeatingGroups, options);
    return getSelectedValueToText(value, langTools, optionList) || '';
  }

  renderSummary({ targetNode }: SummaryRendererProps<'Likert'>): JSX.Element | null {
    const displayData = this.useDisplayData(targetNode);
    return <SummaryItemSimple formDataAsString={displayData} />;
  }
}
