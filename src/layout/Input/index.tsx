import React from 'react';

import { formatNumericText } from '@altinn/altinn-design-system';

import { useAppSelector } from 'src/hooks/useAppSelector';
import { useMapToReactNumberConfig } from 'src/hooks/useMapToReactNumberConfig';
import { InputComponent } from 'src/layout/Input/InputComponent';
import { FormComponent } from 'src/layout/LayoutComponent';
import { SummaryItemSimple } from 'src/layout/Summary/SummaryItemSimple';
import type { PropsFromGenericComponent } from 'src/layout';
import type { IInputFormatting } from 'src/layout/layout';
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

    const numberFormatting = useMapToReactNumberConfig(text, node.item.formatting as IInputFormatting);

    if (numberFormatting?.number) {
      return formatNumericText(text, numberFormatting.number);
    }

    return text;
  }

  renderSummary({ targetNode }: SummaryRendererProps<'Input'>): JSX.Element | null {
    const displayData = this.useDisplayData(targetNode);
    return <SummaryItemSimple formDataAsString={displayData} />;
  }
}
