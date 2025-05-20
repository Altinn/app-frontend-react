import React, { forwardRef } from 'react';
import type { JSX } from 'react';

import { formatNumericText } from '@digdir/design-system-react';

import { useDisplayData } from 'src/features/displayData/useDisplayData';
import { useCurrentLanguage } from 'src/features/language/LanguageProvider';
import { getMapToReactNumberConfig } from 'src/hooks/useMapToReactNumberConfig';
import { InputDef } from 'src/layout/Input/config.def.generated';
import { evalFormatting } from 'src/layout/Input/formatting';
import { InputComponent } from 'src/layout/Input/InputComponent';
import { InputSummary } from 'src/layout/Input/InputSummary';
import { InputComponentNext } from 'src/layout/Input/next/InputComponent.next';
import { SummaryItemSimple } from 'src/layout/Summary/SummaryItemSimple';
import { SingleValueSummaryNext } from 'src/layout/Summary2/CommonSummaryComponents/SingleValueSummaryNext';
import { NodesInternal } from 'src/utils/layout/NodesContext';
import { useNodeFormDataWhenType } from 'src/utils/layout/useNodeItem';
import type { LayoutValidationCtx } from 'src/features/devtools/layoutValidation/types';
import type { PropsFromGenericComponent } from 'src/layout';
import type { CompIntermediateExact } from 'src/layout/layout';
import type { ExprResolver, SummaryRendererProps } from 'src/layout/LayoutComponent';
import type { Summary2Props } from 'src/layout/Summary2/SummaryComponent2/types';
import type { CommonProps } from 'src/next-prev/types/CommonComponentProps';

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

  renderSummaryNext(_: CompIntermediateExact<'Input'>, commonProps: CommonProps): React.JSX.Element | null {
    return (
      <SingleValueSummaryNext
        title={commonProps.label}
        displayData={commonProps.currentValue}
      />
    );
  }

  useDisplayData(nodeId: string): string {
    const formData = useNodeFormDataWhenType(nodeId, 'Input');
    const formatting = NodesInternal.useNodeDataWhenType(nodeId, 'Input', (data) => data.item?.formatting);
    const currentLanguage = useCurrentLanguage();
    const text = formData?.simpleBinding || '';
    if (!text) {
      return '';
    }

    const numberFormatting = getMapToReactNumberConfig(formatting, text, currentLanguage);
    if (numberFormatting?.number) {
      return formatNumericText(text, numberFormatting.number);
    }

    return text;
  }

  renderSummary({ targetNode }: SummaryRendererProps<'Input'>): JSX.Element | null {
    const displayData = useDisplayData(targetNode);
    return <SummaryItemSimple formDataAsString={displayData} />;
  }

  renderSummary2(props: Summary2Props<'Input'>): JSX.Element | null {
    return <InputSummary {...props} />;
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
