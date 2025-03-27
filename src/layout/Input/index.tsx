import React, { forwardRef } from 'react';
import type { JSX } from 'react';

import { formatNumericText } from '@digdir/design-system-react';

import { getMapToReactNumberConfig } from 'src/hooks/useMapToReactNumberConfig';
import { InputDef } from 'src/layout/Input/config.def.generated';
import { evalFormatting } from 'src/layout/Input/formatting';
import { InputComponent } from 'src/layout/Input/InputComponent';
import { InputSummary } from 'src/layout/Input/InputSummary';
import { InputComponentNext } from 'src/layout/Input/next/InputComponent.next';
import { SummaryItemSimple } from 'src/layout/Summary/SummaryItemSimple';
import { SingleValueSummaryNext } from 'src/layout/Summary2/CommonSummaryComponents/SingleValueSummaryNext';
import type { LayoutValidationCtx } from 'src/features/devtools/layoutValidation/types';
import type { DisplayDataProps } from 'src/features/displayData';
import type { PropsFromGenericComponent } from 'src/layout';
import type { CompIntermediateExact } from 'src/layout/layout';
import type { ExprResolver, SummaryRendererProps } from 'src/layout/LayoutComponent';
import type { Summary2Props } from 'src/layout/Summary2/SummaryComponent2/types';
import type { LayoutNode } from 'src/utils/layout/LayoutNode';

export interface CommonProps {
  onChange: (nextValue: string) => void;
  currentValue?: string;
  label: string | undefined;
  required?: boolean;
}

export class Input extends InputDef {
  render = forwardRef<HTMLElement, PropsFromGenericComponent<'Input'>>(
    function LayoutComponentInputRender(props, _): JSX.Element | null {
      return <InputComponent {...props} />;
    },
  );

  renderNext(props: CompIntermediateExact<'Input'>, commonProps: CommonProps): JSX.Element | null {
    return (
      <InputComponentNext
        component={props}
        commonProps={commonProps}
        {...props}
      />
    );
  }

  renderSummaryNext(props: CompIntermediateExact<'Input'>, commonProps: CommonProps): React.JSX.Element | null {
    return (
      <SingleValueSummaryNext
        title={commonProps.label}
        displayData={commonProps.currentValue}
      />
    );
  }

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
        isCompact={props.isCompact}
        emptyFieldText={props.override?.emptyFieldText}
      />
    );
  }

  validateDataModelBindings(ctx: LayoutValidationCtx<'Input'>): string[] {
    return this.validateDataModelBindingsSimple(ctx);
  }

  evalExpressions(props: ExprResolver<'Input'>) {
    return {
      ...this.evalDefaultExpressions(props),
      formatting: evalFormatting(props),
    };
  }
}
