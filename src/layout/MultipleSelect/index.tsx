import React, { forwardRef } from 'react';
import type { JSX } from 'react';

import { useLanguage } from 'src/features/language/useLanguage';
import { getCommaSeparatedOptionsToText } from 'src/features/options/getCommaSeparatedOptionsToText';
import { useAllOptionsSelector } from 'src/features/options/useAllOptions';
import { MultipleChoiceSummary } from 'src/layout/Checkboxes/MultipleChoiceSummary';
import { MultipleSelectDef } from 'src/layout/MultipleSelect/config.def.generated';
import { MultipleSelectComponent } from 'src/layout/MultipleSelect/MultipleSelectComponent';
import { MultipleSelectSummary } from 'src/layout/MultipleSelect/MultipleSelectSummary';
import type { LayoutValidationCtx } from 'src/features/devtools/layoutValidation/types';
import type { DisplayDataProps } from 'src/features/displayData';
import type { IUseLanguage } from 'src/features/language/useLanguage';
import type { FormDataSelector, PropsFromGenericComponent } from 'src/layout';
import type { SummaryRendererProps } from 'src/layout/LayoutComponent';
import type { MultipleSelectSummaryOverrideProps } from 'src/layout/Summary2/config.generated';
import type { LayoutNode } from 'src/utils/layout/LayoutNode';

export class MultipleSelect extends MultipleSelectDef {
  render = forwardRef<HTMLElement, PropsFromGenericComponent<'MultipleSelect'>>(
    function LayoutComponentMultipleSelectRender(props, _): JSX.Element | null {
      return <MultipleSelectComponent {...props} />;
    },
  );

  private getSummaryData(
    node: LayoutNode<'MultipleSelect'>,
    langTools: IUseLanguage,
    options: ReturnType<typeof useAllOptionsSelector>,
    formDataSelector: FormDataSelector,
  ): { [key: string]: string } {
    if (!node.item.dataModelBindings?.simpleBinding) {
      return {};
    }

    const value = String(node.getFormData(formDataSelector).simpleBinding ?? '');
    const optionList = options(node.item.id);
    return getCommaSeparatedOptionsToText(value, optionList, langTools);
  }

  getDisplayData(
    node: LayoutNode<'MultipleSelect'>,
    { langTools, optionsSelector, formDataSelector }: DisplayDataProps,
  ): any {
    return Object.values(this.getSummaryData(node, langTools, optionsSelector, formDataSelector));
  }

  // getDisplayData(
  //   node: LayoutNode<'MultipleSelect'>,
  //   { langTools, optionsSelector, formDataSelector }: DisplayDataProps,
  // ): any {
  //   return Object.values(this.getSummaryData(node, langTools, optionsSelector, formDataSelector));
  // }

  renderSummary({ targetNode, formDataSelector }: SummaryRendererProps<'MultipleSelect'>): JSX.Element | null {
    const langTools = useLanguage();
    const options = useAllOptionsSelector();
    const summaryData = this.getSummaryData(targetNode, langTools, options, formDataSelector);
    return <MultipleChoiceSummary formData={summaryData} />;
  }

  renderSummary2(
    componentNode: LayoutNode<'MultipleSelect'>,
    summaryOverrides?: MultipleSelectSummaryOverrideProps,
  ): JSX.Element | null {
    const displayData = this.useDisplayData(componentNode);

    // const displayDataRaw = this.getDisplayData(componentNode);
    // console.log('displayDataRaw', displayDataRaw);

    // const summaryData = this.getSummaryData(targetNode, langTools, options, formDataSelector);
    // const values = return Object.values(this.getSummaryData(node, langTools, optionsSelector, formDataSelector));
    return (
      <MultipleSelectSummary
        componentNode={componentNode}
        displayData={displayData}
        summaryOverrides={summaryOverrides}
      />
    );
  }

  validateDataModelBindings(ctx: LayoutValidationCtx<'MultipleSelect'>): string[] {
    return this.validateDataModelBindingsSimple(ctx);
  }
}
