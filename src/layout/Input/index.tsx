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
import type { ExprResolved, ExprVal } from 'src/features/expressions/types';
import type { PropsFromGenericComponent } from 'src/layout';
import type { IInputFormatting, PatternFormatProps } from 'src/layout/Input/config.generated';
import type { ExprResolver, SummaryRendererProps } from 'src/layout/LayoutComponent';
import type { Summary2Props } from 'src/layout/Summary2/SummaryComponent2/types';
import type { LayoutNode } from 'src/utils/layout/LayoutNode';

export class Input extends InputDef {
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

  renderSummary2(props: Summary2Props<'Input'>): JSX.Element | null {
    return (
      <InputSummary
        componentNode={props.target}
        summaryOverrides={props.overrides}
        displayData={this.useDisplayData(props.target)}
      />
    );
  }

  validateDataModelBindings(ctx: LayoutValidationCtx<'Input'>): string[] {
    return this.validateDataModelBindingsSimple(ctx);
  }

  evalExpressions(props: ExprResolver<'Input'>) {
    return {
      ...this.evalDefaultExpressions(props),
      formatting: this.evalFormatting(props),
    };
  }

  evalFormatting(props: ExprResolver<'Input'>) {
    if (!props.item.formatting) {
      return undefined;
    }

    const { evalStr, evalAny } = props;
    const out = { ...props.item.formatting } as ExprResolved<IInputFormatting>;
    if (out.number && 'format' in out.number) {
      out.number = {
        ...(out.number as PatternFormatProps),
        format: evalStr(out.number.format, ''),
      };
    } else if (out.number) {
      (out as any).number = { ...out.number };

      if (out.number!.thousandSeparator) {
        out.number.thousandSeparator = evalAny(out.number.thousandSeparator as ExprVal.Any, false) as
          | string
          | boolean
          | undefined;
      }
      if (out.number.decimalSeparator) {
        out.number.decimalSeparator = evalStr(out.number.decimalSeparator, '.');
      }
      if (out.number.suffix) {
        out.number.suffix = evalStr(out.number.suffix, '');
      }
      if (out.number.prefix) {
        out.number.prefix = evalStr(out.number.prefix, '');
      }
    }

    return out;
  }
}
