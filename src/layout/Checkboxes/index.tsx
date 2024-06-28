import React, { forwardRef } from 'react';
import type { JSX } from 'react';

import { Lang } from 'src/features/language/Lang';
import { useLanguage } from 'src/features/language/useLanguage';
import { getCommaSeparatedOptionsToText } from 'src/features/options/getCommaSeparatedOptionsToText';
import { useNodeOptionsSelector } from 'src/features/options/useNodeOptions';
import { CheckboxContainerComponent } from 'src/layout/Checkboxes/CheckboxesContainerComponent';
import { CheckboxesDef } from 'src/layout/Checkboxes/config.def.generated';
import { MultipleChoiceSummary } from 'src/layout/Checkboxes/MultipleChoiceSummary';
import { MultipleValueSummary } from 'src/layout/Summary2/CommonSummaryComponents/MultipleValueSummary';
import type { LayoutValidationCtx } from 'src/features/devtools/layoutValidation/types';
import type { DisplayDataProps } from 'src/features/displayData';
import type { IUseLanguage } from 'src/features/language/useLanguage';
import type { NodeOptionsSelector } from 'src/features/options/OptionsStorePlugin';
import type { PropsFromGenericComponent } from 'src/layout';
import type { SummaryRendererProps } from 'src/layout/LayoutComponent';
import type { CheckboxSummaryOverrideProps } from 'src/layout/Summary2/config.generated';
import type { LayoutNode } from 'src/utils/layout/LayoutNode';
import type { NodeFormDataSelector } from 'src/utils/layout/useNodeItem';

export class Checkboxes extends CheckboxesDef {
  render = forwardRef<HTMLElement, PropsFromGenericComponent<'Checkboxes'>>(
    function LayoutComponentCheckboxesRender(props, _): JSX.Element | null {
      return <CheckboxContainerComponent {...props} />;
    },
  );

  private getSummaryData(
    node: LayoutNode<'Checkboxes'>,
    langTools: IUseLanguage,
    optionsSelector: NodeOptionsSelector,
    nodeDataSelector: NodeFormDataSelector,
  ): { [key: string]: string } {
    const value = nodeDataSelector(node).simpleBinding ?? '';
    const { options } = optionsSelector(node);
    return getCommaSeparatedOptionsToText(value, options, langTools);
  }

  getDisplayData(
    node: LayoutNode<'Checkboxes'>,
    { langTools, optionsSelector, nodeFormDataSelector }: DisplayDataProps,
  ): string {
    return Object.values(this.getSummaryData(node, langTools, optionsSelector, nodeFormDataSelector)).join(', ');
  }

  renderSummary({ targetNode, nodeFormDataSelector }: SummaryRendererProps<'Checkboxes'>): JSX.Element | null {
    const langTools = useLanguage();
    const options = useNodeOptionsSelector();
    const summaryData = this.getSummaryData(targetNode, langTools, options, nodeFormDataSelector);
    return <MultipleChoiceSummary formData={summaryData} />;
  }

  renderSummary2(
    componentNode: LayoutNode<'Checkboxes'>,
    summaryOverrides?: CheckboxSummaryOverrideProps,
  ): JSX.Element | null {
    const displayData = this.useDisplayData(componentNode);
    const maxStringLength = 75;
    const showAsList =
      summaryOverrides?.displayType === 'list' ||
      (!summaryOverrides?.displayType && displayData?.length >= maxStringLength);
    const title = componentNode.item.textResourceBindings?.title;
    return (
      <MultipleValueSummary
        title={<Lang id={title} />}
        componentNode={componentNode}
        showAsList={showAsList}
      />
    );
  }

  validateDataModelBindings(ctx: LayoutValidationCtx<'Checkboxes'>): string[] {
    return this.validateDataModelBindingsSimple(ctx);
  }
}
