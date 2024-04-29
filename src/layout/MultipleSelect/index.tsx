import React, { forwardRef } from 'react';
import type { JSX } from 'react';

import { useLanguage } from 'src/features/language/useLanguage';
import { getCommaSeparatedOptionsToText } from 'src/features/options/getCommaSeparatedOptionsToText';
import { useNodeOptionsSelector } from 'src/features/options/useNodeOptions';
import { MultipleChoiceSummary } from 'src/layout/Checkboxes/MultipleChoiceSummary';
import { MultipleSelectDef } from 'src/layout/MultipleSelect/config.def.generated';
import { MultipleSelectComponent } from 'src/layout/MultipleSelect/MultipleSelectComponent';
import type { LayoutValidationCtx } from 'src/features/devtools/layoutValidation/types';
import type { DisplayDataProps } from 'src/features/displayData';
import type { IUseLanguage } from 'src/features/language/useLanguage';
import type { NodeOptionsSelector } from 'src/features/options/OptionsStorePlugin';
import type { FormDataSelector, PropsFromGenericComponent } from 'src/layout';
import type { CompInternal } from 'src/layout/layout';
import type { SummaryRendererProps } from 'src/layout/LayoutComponent';
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
    optionsSelector: NodeOptionsSelector,
    formDataSelector: FormDataSelector,
  ): { [key: string]: string } {
    if (!node.item.dataModelBindings?.simpleBinding) {
      return {};
    }

    const value = String(node.getFormData(formDataSelector).simpleBinding ?? '');
    const optionList = optionsSelector(node);
    return getCommaSeparatedOptionsToText(value, optionList, langTools);
  }

  getDisplayData(
    node: LayoutNode<'MultipleSelect'>,
    _item: CompInternal<'MultipleSelect'>,
    { langTools, optionsSelector, formDataSelector }: DisplayDataProps,
  ): string {
    return Object.values(this.getSummaryData(node, langTools, optionsSelector, formDataSelector)).join(', ');
  }

  renderSummary({ targetNode, formDataSelector }: SummaryRendererProps<'MultipleSelect'>): JSX.Element | null {
    const langTools = useLanguage();
    const options = useNodeOptionsSelector();
    const summaryData = this.getSummaryData(targetNode, langTools, options, formDataSelector);
    return <MultipleChoiceSummary formData={summaryData} />;
  }

  validateDataModelBindings(ctx: LayoutValidationCtx<'MultipleSelect'>): string[] {
    return this.validateDataModelBindingsSimple(ctx);
  }
}
