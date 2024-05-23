import React, { forwardRef } from 'react';
import type { JSX } from 'react';

import { Label, List, Paragraph } from '@digdir/designsystemet-react';

import { Lang } from 'src/features/language/Lang';
import { useLanguage } from 'src/features/language/useLanguage';
import { getCommaSeparatedOptionsToText } from 'src/features/options/getCommaSeparatedOptionsToText';
import { useAllOptionsSelector } from 'src/features/options/useAllOptions';
import { CheckboxContainerComponent } from 'src/layout/Checkboxes/CheckboxesContainerComponent';
import { CheckboxesDef } from 'src/layout/Checkboxes/config.def.generated';
import { MultipleChoiceSummary } from 'src/layout/Checkboxes/MultipleChoiceSummary';
import classes from 'src/layout/RadioButtons/ControlledRadioGroupSummary.module.css';
import type { LayoutValidationCtx } from 'src/features/devtools/layoutValidation/types';
import type { DisplayDataProps } from 'src/features/displayData';
import type { IUseLanguage } from 'src/features/language/useLanguage';
import type { FormDataSelector, PropsFromGenericComponent } from 'src/layout';
import type { SummaryRendererProps } from 'src/layout/LayoutComponent';
import type { LayoutNode } from 'src/utils/layout/LayoutNode';

export class Checkboxes extends CheckboxesDef {
  render = forwardRef<HTMLElement, PropsFromGenericComponent<'Checkboxes'>>(
    function LayoutComponentCheckboxesRender(props, _): JSX.Element | null {
      return <CheckboxContainerComponent {...props} />;
    },
  );

  private getSummaryData(
    node: LayoutNode<'Checkboxes'>,
    langTools: IUseLanguage,
    optionsSelector: ReturnType<typeof useAllOptionsSelector>,
    formDataSelector: FormDataSelector,
  ): { [key: string]: string } {
    const value = node.getFormData(formDataSelector).simpleBinding ?? '';
    const optionList = optionsSelector(node.item.id);
    return getCommaSeparatedOptionsToText(value, optionList, langTools);
  }

  private renderSummaryListItems(displayData: string): JSX.Element[] {
    return displayData.split(',').map((item, index) => (
      <List.Item
        key={`list-item-${index}`}
        className={classes.formValue}
      >
        {item}
      </List.Item>
    ));
  }

  private renderSummaryDisplayData(displayData: string): JSX.Element {
    return displayData?.length > 75 ? (
      <List.Root>
        <List.Unordered>{this.renderSummaryListItems(displayData)}</List.Unordered>
      </List.Root>
    ) : (
      <Paragraph className={classes.formValue}>{displayData}</Paragraph>
    );
  }

  getDisplayData(
    node: LayoutNode<'Checkboxes'>,
    { langTools, optionsSelector, formDataSelector }: DisplayDataProps,
  ): string {
    return Object.values(this.getSummaryData(node, langTools, optionsSelector, formDataSelector)).join(', ');
  }

  renderSummary({ targetNode, formDataSelector }: SummaryRendererProps<'Checkboxes'>): JSX.Element | null {
    const langTools = useLanguage();
    const options = useAllOptionsSelector();
    const summaryData = this.getSummaryData(targetNode, langTools, options, formDataSelector);
    return <MultipleChoiceSummary formData={summaryData} />;
  }

  renderSummary2(summaryNode: LayoutNode<'Checkboxes'>): JSX.Element | null {
    const { textResourceBindings } = summaryNode.item;
    const displayData = this.useDisplayData(summaryNode);
    return (
      <>
        <Label weight={'regular'}>
          <Lang id={textResourceBindings?.title}></Lang>
        </Label>
        {this.renderSummaryDisplayData(displayData)}
      </>
    );
  }

  validateDataModelBindings(ctx: LayoutValidationCtx<'Checkboxes'>): string[] {
    return this.validateDataModelBindingsSimple(ctx);
  }
}
