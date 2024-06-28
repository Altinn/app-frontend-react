import React, { forwardRef } from 'react';
import type { JSX } from 'react';

import { formatNumericText } from '@digdir/design-system-react';

import { getMapToReactNumberConfig } from 'src/hooks/useMapToReactNumberConfig';
import { InputDef } from 'src/layout/Input/config.def.generated';
import { InputComponent } from 'src/layout/Input/InputComponent';
import { InputSummary } from 'src/layout/Input/InputSummary';
import { SummaryItemSimple } from 'src/layout/Summary/SummaryItemSimple';
import type { LayoutValidationCtx } from 'src/features/devtools/layoutValidation/types';
import type { DisplayDataProps } from 'src/features/displayData';
import type { ExprVal, ExprValToActualOrExpr } from 'src/features/expressions/types';
import type { PropsFromGenericComponent, ValidationFilter, ValidationFilterFunction } from 'src/layout';
import type { NumberFormatProps, PatternFormatProps } from 'src/layout/Input/config.generated';
import type { ExprResolver, SummaryRendererProps } from 'src/layout/LayoutComponent';
import type { InputSummaryOverrideProps } from 'src/layout/Summary2/config.generated';
import type { LayoutNode } from 'src/utils/layout/LayoutNode';
import type { NodeDataSelector } from 'src/utils/layout/NodesContext';

export class Input extends InputDef implements ValidationFilter {
  render = forwardRef<HTMLElement, PropsFromGenericComponent<'Input'>>(
    function LayoutComponentInputRender(props, _): JSX.Element | null {
      return <InputComponent {...props} />;
    },
  );

  getDisplayData(
    node: LayoutNode<'Input'>,
    { currentLanguage, nodeFormDataSelector, nodeDataSelector }: DisplayDataProps,
  ): string {
    const text = nodeFormDataSelector(node).simpleBinding || '';
    if (!text) {
      return '';
    }

    const formatting = nodeDataSelector((picker) => picker(node)?.item?.formatting, [node]);
    const numberFormatting = getMapToReactNumberConfig(formatting, text, currentLanguage);

    if (numberFormatting?.number) {
      return formatNumericText(text, numberFormatting.number);
    }

    return text;
  }

  renderSummary({ targetNode }: SummaryRendererProps<'Input'>): JSX.Element | null {
    const displayData = this.useDisplayData(targetNode);
    return <SummaryItemSimple formDataAsString={displayData} />;
  }

  renderSummary2(componentNode: LayoutNode<'Input'>, summaryOverrides?: InputSummaryOverrideProps): JSX.Element | null {
    return (
      <InputSummary
        componentNode={componentNode}
        summaryOverrides={summaryOverrides}
        displayData={this.useDisplayData(componentNode)}
      />
    );
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

  getValidationFilters(node: LayoutNode<'Input'>, nodeDataSelector: NodeDataSelector): ValidationFilterFunction[] {
    const maxLength = nodeDataSelector((picker) => picker(node)?.item?.maxLength, [node]);
    if (maxLength === undefined) {
      return [];
    }

    return [
      (validation) =>
        !(validation.message.key === 'validation_errors.maxLength' && validation.message.params?.at(0) === maxLength),
    ];
  }
}
