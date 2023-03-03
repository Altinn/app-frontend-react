import React from 'react';

import { formatNumericText } from '@altinn/altinn-design-system';

import { InputComponent } from 'src/layout/Input/InputComponent';
import { FormComponent } from 'src/layout/LayoutComponent';
import type { PropsFromGenericComponent } from 'src/layout';
import type { NumberFormatProps } from 'src/layout/layout';
import type { SummaryRendererProps } from 'src/layout/LayoutComponent';

export class Input extends FormComponent<'Input'> {
  render(props: PropsFromGenericComponent<'Input'>): JSX.Element | null {
    return <InputComponent {...props} />;
  }

  getDisplayData({ targetNode, lookups }: SummaryRendererProps<'Input'>): string {
    if (!targetNode.item.dataModelBindings?.simpleBinding) {
      return '';
    }

    const text = lookups.formData[targetNode.item.dataModelBindings.simpleBinding] || '';
    const numberFormatting = targetNode.item.formatting?.number as NumberFormatProps | undefined;
    if (numberFormatting) {
      return formatNumericText(text, numberFormatting);
    }

    return text;
  }

  renderSummary(_props: SummaryRendererProps<'Input'>): JSX.Element | null {
    // PRIORITY: Implement
    return <span>Nothing implemented yet</span>;
  }
}
