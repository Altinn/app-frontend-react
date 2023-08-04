import React from 'react';

import { getOptionList } from 'src/hooks/useOptionList';
import { getSelectedValueToText } from 'src/hooks/useSelectedValueToText';
import { RadioButtonsDef } from 'src/layout/RadioButtons/config.generated';
import { RadioButtonContainerComponent } from 'src/layout/RadioButtons/RadioButtonsContainerComponent';
import { SummaryItemSimple } from 'src/layout/Summary/SummaryItemSimple';
import type { DisplayDataProps, PropsFromGenericComponent } from 'src/layout';
import type { SummaryRendererProps } from 'src/layout/LayoutComponent';
import type { LayoutNodeFromType } from 'src/utils/layout/hierarchy.types';

export class RadioButtons extends RadioButtonsDef {
  render(props: PropsFromGenericComponent<'RadioButtons'>): JSX.Element | null {
    return <RadioButtonContainerComponent {...props} />;
  }

  getDisplayData(
    node: LayoutNodeFromType<'RadioButtons'>,
    { formData, langTools, uiConfig, options }: DisplayDataProps,
  ): string {
    const value = node.item.dataModelBindings?.simpleBinding
      ? formData[node.item.dataModelBindings.simpleBinding] || ''
      : '';
    const optionList = getOptionList(node.item, langTools.textResources, formData, uiConfig.repeatingGroups, options);
    return getSelectedValueToText(value, langTools, optionList) || '';
  }

  renderSummary({ targetNode }: SummaryRendererProps<'RadioButtons'>): JSX.Element | null {
    const displayData = this.useDisplayData(targetNode);
    return <SummaryItemSimple formDataAsString={displayData} />;
  }
}
