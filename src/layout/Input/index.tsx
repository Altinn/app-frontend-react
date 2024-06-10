import React, { forwardRef } from 'react';
import type { JSX } from 'react';

import { formatNumericText } from '@digdir/design-system-react';

import { getMapToReactNumberConfig } from 'src/hooks/useMapToReactNumberConfig';
import { InputDef } from 'src/layout/Input/config.def.generated';
import { InputComponent } from 'src/layout/Input/InputComponent';
import { SummaryItemSimple } from 'src/layout/Summary/SummaryItemSimple';
import type { LayoutValidationCtx } from 'src/features/devtools/layoutValidation/types';
import type { DisplayDataProps } from 'src/features/displayData';
import type { ExprVal, ExprValToActualOrExpr } from 'src/features/expressions/types';
import type { PropsFromGenericComponent } from 'src/layout';
import type { NumberFormatProps, PatternFormatProps } from 'src/layout/Input/config.generated';
import type { CompInternal } from 'src/layout/layout';
import type { ExprResolver, SummaryRendererProps } from 'src/layout/LayoutComponent';
import type { LayoutNode } from 'src/utils/layout/LayoutNode';

export class Input extends InputDef {
  render = forwardRef<HTMLElement, PropsFromGenericComponent<'Input'>>(
    function LayoutComponentInputRender(props, _): JSX.Element | null {
      return <InputComponent {...props} />;
    },
  );

  getDisplayData(
    node: LayoutNode<'Input'>,
    item: CompInternal<'Input'>,
    { currentLanguage, nodeFormDataSelector }: DisplayDataProps,
  ): string {
    if (!item.dataModelBindings?.simpleBinding) {
      return '';
    }

    const text = nodeFormDataSelector(node).simpleBinding || '';
    const numberFormatting = getMapToReactNumberConfig(item.formatting, text, currentLanguage);

    if (numberFormatting?.number) {
      return formatNumericText(text, numberFormatting.number);
    }

    return text;
  }

  renderSummary({ targetNode }: SummaryRendererProps<'Input'>): JSX.Element | null {
    const displayData = this.useDisplayData(targetNode);
    return <SummaryItemSimple formDataAsString={displayData} />;
  }

  validateDataModelBindings(ctx: LayoutValidationCtx<'Input'>): string[] {
    return this.validateDataModelBindingsSimple(ctx);
  }

  evalExpressions(props: ExprResolver<'Input'>) {
    const { item, evalStr, evalAny } = props;

    return {
      ...this.evalDefaultExpressions(props),
      formatting: item.formatting
        ? {
            ...item.formatting,
            number:
              item.formatting.number && 'format' in item.formatting.number
                ? {
                    ...(item.formatting.number as PatternFormatProps),
                    format: evalStr(item.formatting.number.format, ''),
                  }
                : item.formatting.number
                  ? {
                      ...(item.formatting.number as NumberFormatProps),
                      thousandSeparator: evalAny(
                        item.formatting.number.thousandSeparator as ExprValToActualOrExpr<ExprVal.Any>,
                        false,
                      ) as string | boolean | undefined,
                      decimalSeparator: evalStr(item.formatting.number.decimalSeparator, '.'),
                      suffix: evalStr(item.formatting.number.suffix, ''),
                      prefix: evalStr(item.formatting.number.prefix, ''),
                    }
                  : undefined,
          }
        : undefined,
    };
  }
}
