import React, { forwardRef } from 'react';
import type { JSX } from 'react';

import { Label } from 'src/app-components/Label/Label';
import { TextArea as TextAreaAppComponent } from 'src/app-components/TextArea/TextArea';
import { useDisplayData } from 'src/features/displayData/useDisplayData';
import { SummaryItemSimple } from 'src/layout/Summary/SummaryItemSimple';
import { SingleValueSummaryNext } from 'src/layout/Summary2/CommonSummaryComponents/SingleValueSummaryNext';
import { TextAreaDef } from 'src/layout/TextArea/config.def.generated';
import { TextAreaComponent } from 'src/layout/TextArea/TextAreaComponent';
import { TextAreaSummary } from 'src/layout/TextArea/TextAreaSummary';
import { useNodeFormDataWhenType } from 'src/utils/layout/useNodeItem';
import type { LayoutValidationCtx } from 'src/features/devtools/layoutValidation/types';
import type { PropsFromGenericComponent } from 'src/layout';
import type { CompIntermediateExact } from 'src/layout/layout';
import type { SummaryRendererProps } from 'src/layout/LayoutComponent';
import type { Summary2Props } from 'src/layout/Summary2/SummaryComponent2/types';
import type { CommonProps } from 'src/next-prev/types/CommonComponentProps';

export class TextArea extends TextAreaDef {
  render = forwardRef<HTMLElement, PropsFromGenericComponent<'TextArea'>>(
    function LayoutComponentTextAreaRender(props, _): JSX.Element | null {
      return <TextAreaComponent {...props} />;
    },
  );

  renderNext(props: CompIntermediateExact<'TextArea'>, commonProps: CommonProps): React.JSX.Element | null {
    return (
      <Label
        htmlFor={props.id}
        label={commonProps.label || ''}
        grid={props?.grid}
        required={false}
      >
        <TextAreaAppComponent
          value={commonProps.currentValue || ''}
          onChange={(value) => {
            commonProps.onChange(value);
          }}
          id={props.id}
        />
      </Label>
    );
  }

  useDisplayData(nodeId: string): string {
    const formData = useNodeFormDataWhenType(nodeId, 'TextArea');
    return formData?.simpleBinding ?? '';
  }

  renderSummary({ targetNode }: SummaryRendererProps<'TextArea'>): JSX.Element | null {
    const displayData = useDisplayData(targetNode);
    return <SummaryItemSimple formDataAsString={displayData} />;
  }

  renderSummaryNext(_: CompIntermediateExact<'TextArea'>, commonProps: CommonProps): React.JSX.Element | null {
    return (
      <SingleValueSummaryNext
        title={commonProps.label}
        displayData={commonProps.currentValue}
      />
    );
  }

  renderSummary2(props: Summary2Props<'TextArea'>): JSX.Element | null {
    return (
      <TextAreaSummary
        componentNode={props.target}
        isCompact={props.isCompact}
        emptyFieldText={props.override?.emptyFieldText}
      />
    );
  }

  validateDataModelBindings(ctx: LayoutValidationCtx<'TextArea'>): string[] {
    return this.validateDataModelBindingsSimple(ctx);
  }
}
