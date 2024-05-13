import React, { forwardRef } from 'react';
import type { JSX } from 'react';

import { formatNumericText } from '@digdir/design-system-react';
import { Label, Paragraph } from '@digdir/designsystemet-react';

import { Lang } from 'src/features/language/Lang';
import { getMapToReactNumberConfig } from 'src/hooks/useMapToReactNumberConfig';
import { InputDef } from 'src/layout/Input/config.def.generated';
import { InputComponent } from 'src/layout/Input/InputComponent';
import classes from 'src/layout/Input/InputComponentSummary.module.css';
import { SummaryItemSimple } from 'src/layout/Summary/SummaryItemSimple';
import type { LayoutValidationCtx } from 'src/features/devtools/layoutValidation/types';
import type { DisplayDataProps } from 'src/features/displayData';
import type { PropsFromGenericComponent } from 'src/layout';
import type { IInputFormatting } from 'src/layout/Input/config.generated';
import type { SummaryRendererProps } from 'src/layout/LayoutComponent';
import type { LayoutNode } from 'src/utils/layout/LayoutNode';
export class Input extends InputDef {
  render = forwardRef<HTMLElement, PropsFromGenericComponent<'Input'>>(
    function LayoutComponentInputRender(props, _): JSX.Element | null {
      return <InputComponent {...props} />;
    },
  );

  getDisplayData(node: LayoutNode<'Input'>, { currentLanguage, formDataSelector }: DisplayDataProps): string {
    if (!node.item.dataModelBindings?.simpleBinding) {
      return '';
    }

    const text = node.getFormData(formDataSelector).simpleBinding || '';
    const numberFormatting = getMapToReactNumberConfig(
      node.item.formatting as IInputFormatting | undefined,
      text,
      currentLanguage,
    );

    if (numberFormatting?.number) {
      return formatNumericText(text, numberFormatting.number);
    }

    return text;
  }

  renderSummary({ targetNode }: SummaryRendererProps<'Input'>): JSX.Element | null {
    const displayData = this.useDisplayData(targetNode);
    return <SummaryItemSimple formDataAsString={displayData} />;
  }

  renderSummary2(summaryNode: LayoutNode<'Input'>): JSX.Element | null {
    const { textResourceBindings } = summaryNode.item;
    const displayData = this.useDisplayData(summaryNode);
    return (
      <>
        <Label weight={'regular'}>
          <Lang id={textResourceBindings?.title}></Lang>
        </Label>
        <Paragraph className={classes.formValue}>{displayData}</Paragraph>
      </>
    );
  }
  validateDataModelBindings(ctx: LayoutValidationCtx<'Input'>): string[] {
    return this.validateDataModelBindingsSimple(ctx);
  }
}
