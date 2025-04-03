import React, { forwardRef } from 'react';
import type { JSX } from 'react';

import { Radio } from '@digdir/designsystemet-react';

import { getSelectedValueToText } from 'src/features/options/getSelectedValueToText';
import { runEmptyFieldValidationOnlySimpleBinding } from 'src/features/validation/nodeValidation/emptyFieldValidation';
import { RadioButtonsDef } from 'src/layout/RadioButtons/config.def.generated';
import { ControlledRadioGroup } from 'src/layout/RadioButtons/ControlledRadioGroup';
import { RadioButtonsSummary } from 'src/layout/RadioButtons/RadioButtonsSummary';
import { SummaryItemSimple } from 'src/layout/Summary/SummaryItemSimple';
import type { LayoutValidationCtx } from 'src/features/devtools/layoutValidation/types';
import type { DisplayDataProps } from 'src/features/displayData';
import type { ComponentValidation, ValidationDataSources } from 'src/features/validation';
import type { PropsFromGenericComponent } from 'src/layout';
import type { CommonProps } from 'src/layout/Input';
import type { CompIntermediateExact } from 'src/layout/layout';
import type { SummaryRendererProps } from 'src/layout/LayoutComponent';
import type { Summary2Props } from 'src/layout/Summary2/SummaryComponent2/types';
import type { BaseLayoutNode, LayoutNode } from 'src/utils/layout/LayoutNode';

export class RadioButtons extends RadioButtonsDef {
  render = forwardRef<HTMLElement, PropsFromGenericComponent<'RadioButtons'>>(
    function LayoutComponentRadioButtonsRender(props, _): JSX.Element | null {
      return <ControlledRadioGroup {...props} />;
    },
  );

  renderNext(component: CompIntermediateExact<'RadioButtons'>, commonProps: CommonProps): React.JSX.Element | null {
    const options = component.options || commonProps.options;

    return (
      <div>
        <Radio.Group
          legend=''
          role='radiogroup'
        >
          {options?.map((option, idx) => (
            <Radio
              value={`${option.value}`}
              description={option.description}
              key={idx}
              onChange={(e) => {
                commonProps.onChange(e.target.value);
              }}
            >
              {option.label}
            </Radio>
          ))}
        </Radio.Group>
      </div>
    );
  }

  getDisplayData(
    node: LayoutNode<'RadioButtons'>,
    { langTools, optionsSelector, nodeFormDataSelector }: DisplayDataProps,
  ): string {
    const value = String(nodeFormDataSelector(node).simpleBinding ?? '');
    const { options } = optionsSelector(node);
    return getSelectedValueToText(value, langTools, options) || '';
  }

  renderSummary({ targetNode }: SummaryRendererProps<'RadioButtons'>): JSX.Element | null {
    const displayData = this.useDisplayData(targetNode);
    return <SummaryItemSimple formDataAsString={displayData} />;
  }

  renderSummary2(props: Summary2Props<'RadioButtons'>): JSX.Element | null {
    return (
      <RadioButtonsSummary
        componentNode={props.target}
        emptyFieldText={props.override?.emptyFieldText}
        isCompact={props.isCompact}
      />
    );
  }

  runEmptyFieldValidation(
    node: BaseLayoutNode<'RadioButtons'>,
    validationDataSources: ValidationDataSources,
  ): ComponentValidation[] {
    return runEmptyFieldValidationOnlySimpleBinding(node, validationDataSources);
  }

  validateDataModelBindings(ctx: LayoutValidationCtx<'RadioButtons'>): string[] {
    return this.validateDataModelBindingsSimple(ctx);
  }
}
