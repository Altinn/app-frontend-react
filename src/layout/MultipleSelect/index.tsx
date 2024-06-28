import React, { forwardRef } from 'react';
import type { JSX } from 'react';

import { useLanguage } from 'src/features/language/useLanguage';
import { getCommaSeparatedOptionsToText } from 'src/features/options/getCommaSeparatedOptionsToText';
import { useNodeOptionsSelector } from 'src/features/options/useNodeOptions';
import { MultipleChoiceSummary } from 'src/layout/Checkboxes/MultipleChoiceSummary';
import { MultipleSelectDef } from 'src/layout/MultipleSelect/config.def.generated';
import { MultipleSelectComponent } from 'src/layout/MultipleSelect/MultipleSelectComponent';
import { MultipleSelectSummary } from 'src/layout/MultipleSelect/MultipleSelectSummary';
import type { LayoutValidationCtx } from 'src/features/devtools/layoutValidation/types';
import type { DisplayDataProps } from 'src/features/displayData';
import type { IUseLanguage } from 'src/features/language/useLanguage';
import type { NodeOptionsSelector } from 'src/features/options/OptionsStorePlugin';
import type { PropsFromGenericComponent } from 'src/layout';
import type { SummaryRendererProps } from 'src/layout/LayoutComponent';
import type { Summary2Props } from 'src/layout/Summary2/SummaryComponent2/types';
import type { LayoutNode } from 'src/utils/layout/LayoutNode';
import type { NodeFormDataSelector } from 'src/utils/layout/useNodeItem';

export class MultipleSelect extends MultipleSelectDef {
  render = forwardRef<HTMLElement, PropsFromGenericComponent<'MultipleSelect'>>(
    function LayoutComponentMultipleSelectRender(props, _): JSX.Element | null {
      return <MultipleSelectComponent {...props} />;
    },
  );

  private getSummaryData(
    node: LayoutNode<'MultipleSelect'>,
    langTools: IUseLanguage,
    optionsSelector: NodeOptionsSelector,
    nodeDataSelector: NodeFormDataSelector,
  ): { [key: string]: string } {
    const data = nodeDataSelector(node);
    if (!data.simpleBinding) {
      return {};
    }

    const value = String(data.simpleBinding ?? '');
    const { options } = optionsSelector(node);
    return getCommaSeparatedOptionsToText(value, options, langTools);
  }

  getDisplayData(
    node: LayoutNode<'MultipleSelect'>,
    { langTools, optionsSelector, nodeFormDataSelector }: DisplayDataProps,
  ): string {
    return Object.values(this.getSummaryData(node, langTools, optionsSelector, nodeFormDataSelector)).join(', ');
  }

  renderSummary({ targetNode, nodeFormDataSelector }: SummaryRendererProps<'MultipleSelect'>): JSX.Element | null {
    const langTools = useLanguage();
    const options = useNodeOptionsSelector();
    const summaryData = this.getSummaryData(targetNode, langTools, options, nodeFormDataSelector);
    return <MultipleChoiceSummary formData={summaryData} />;
  }

  renderSummary2(props: Summary2Props<'MultipleSelect'>): JSX.Element | null {
    const displayData = this.useDisplayData(props.target);
    return (
      <MultipleSelectSummary
        componentNode={props.target}
        summaryOverrides={props.overrides}
        displayData={displayData}
      />
    );
  }

  validateDataModelBindings(ctx: LayoutValidationCtx<'MultipleSelect'>): string[] {
    return this.validateDataModelBindingsSimple(ctx);
  }
}
