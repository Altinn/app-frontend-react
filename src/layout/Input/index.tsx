import React from 'react';

import { formatNumericText } from '@altinn/altinn-design-system';

import { useAppSelector } from 'src/hooks/useAppSelector';
import { useMapToReactNumberConfig } from 'src/hooks/useMapToReactNumberConfig';
import { InputComponent } from 'src/layout/Input/InputComponent';
import { FormComponent } from 'src/layout/LayoutComponent';
import { SummaryItemSimple } from 'src/layout/Summary/SummaryItemSimple';
import type { PropsFromGenericComponent } from 'src/layout';
import type { IInputFormatting, NumberFormatProps } from 'src/layout/layout';
import type { SummaryRendererProps } from 'src/layout/LayoutComponent';
import type { LayoutNodeFromType } from 'src/utils/layout/hierarchy.types';

export class Input extends FormComponent<'Input'> {
  render(props: PropsFromGenericComponent<'Input'>): JSX.Element | null {
    return <InputComponent {...props} />;
  }

  useDisplayData(node: LayoutNodeFromType<'Input'>): string {
    const formData = useAppSelector((state) => state.formData.formData);
    if (!node.item.dataModelBindings?.simpleBinding) {
      return '';
    }

    const text = formData[node.item.dataModelBindings.simpleBinding] || '';

    // if(node.item.formatting.currency || node.item.formatting.unit) {
    //   useMapToReactNumberConfig()
    // }
    const itemFormatting = useMapToReactNumberConfig(text, node.item.formatting as IInputFormatting);
    console.log(itemFormatting);
    // const numberFormatting = node.item.formatting?.number as NumberFormatProps | undefined;
    const numberFormatting = itemFormatting?.number as NumberFormatProps | undefined;
    // const numberIntlFormatting = useMapToReactNumberConfig(text, numberFormatting);

    console.log(numberFormatting);
    if (numberFormatting) {
      return formatNumericText(text, numberFormatting);
    }

    return text;
  }

  renderSummary({ targetNode }: SummaryRendererProps<'Input'>): JSX.Element | null {
    const displayData = this.useDisplayData(targetNode);
    return <SummaryItemSimple formDataAsString={displayData} />;
  }
}
