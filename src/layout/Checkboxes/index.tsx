import React, { forwardRef } from 'react';
import type { JSX } from 'react';

import { getCommaSeparatedOptionsToText } from 'src/features/options/getCommaSeparatedOptionsToText';
import { runEmptyFieldValidationOnlySimpleBinding } from 'src/features/validation/nodeValidation/emptyFieldValidation';
import { CheckboxContainerComponent } from 'src/layout/Checkboxes/CheckboxesContainerComponent';
import { CheckboxesSummary } from 'src/layout/Checkboxes/CheckboxesSummary';
import { CheckboxesDef } from 'src/layout/Checkboxes/config.def.generated';
import { MultipleChoiceSummary } from 'src/layout/Checkboxes/MultipleChoiceSummary';
import type { LayoutValidationCtx } from 'src/features/devtools/layoutValidation/types';
import type { DisplayDataProps } from 'src/features/displayData';
import type { ComponentValidation, ValidationDataSources } from 'src/features/validation';
import type { PropsFromGenericComponent } from 'src/layout';
import type { SummaryRendererProps } from 'src/layout/LayoutComponent';
import type { CheckboxSummaryOverrideProps } from 'src/layout/Summary2/config.generated';
import type { Summary2Props } from 'src/layout/Summary2/SummaryComponent2/types';
import type { BaseLayoutNode, LayoutNode } from 'src/utils/layout/LayoutNode';

export class Checkboxes extends CheckboxesDef {
  render = forwardRef<HTMLElement, PropsFromGenericComponent<'Checkboxes'>>(
    function LayoutComponentCheckboxesRender(props, _): JSX.Element | null {
      return <CheckboxContainerComponent {...props} />;
    },
  );

  private getSummaryData(
    node: LayoutNode<'Checkboxes'>,
    { nodeFormDataSelector, optionsSelector, langTools }: DisplayDataProps,
  ): { [key: string]: string } {
    const value = nodeFormDataSelector(node).simpleBinding ?? '';
    const { options } = optionsSelector(node);
    return getCommaSeparatedOptionsToText(value, options, langTools);
  }

  getDisplayData(node: LayoutNode<'Checkboxes'>, props: DisplayDataProps): string {
    return Object.values(this.getSummaryData(node, props)).join(', ');
  }

  renderSummary({ targetNode }: SummaryRendererProps<'Checkboxes'>): JSX.Element | null {
    return <MultipleChoiceSummary getFormData={(props) => this.getSummaryData(targetNode, props)} />;
  }

  renderSummary2(props: Summary2Props<'Checkboxes'>): JSX.Element | null {
    return (
      <CheckboxesSummary
        componentNode={props.target}
        summaryOverride={props.override as CheckboxSummaryOverrideProps}
        isCompact={props.isCompact}
        emptyFieldText={props.override?.emptyFieldText}
      />
    );
  }

  runEmptyFieldValidation(
    node: BaseLayoutNode<'Checkboxes'>,
    validationDataSources: ValidationDataSources,
  ): ComponentValidation[] {
    return runEmptyFieldValidationOnlySimpleBinding(node, validationDataSources);
  }

  validateDataModelBindings(ctx: LayoutValidationCtx<'Checkboxes'>): string[] {
    const errors: string[] = [];
    const allowedTypes = ['string', 'boolean', 'number', 'integer'];

    const dataModelBindings = ctx.item.dataModelBindings ?? {};

    if (!dataModelBindings?.saveToList) {
      for (const [binding] of Object.entries(dataModelBindings ?? {})) {
        const [newErrors] = this.validateDataModelBindingsAny(ctx, binding, allowedTypes, false);
        errors.push(...(newErrors || []));
      }
    }

    const [newErrors] = this.validateDataModelBindingsAny(ctx, 'saveToList', ['array'], false);
    if (newErrors) {
      errors.push(...(newErrors || []));
    }

    if (dataModelBindings?.saveToList) {
      const isCompatible = dataModelBindings?.simpleBinding?.field.includes(`${dataModelBindings.saveToList.field}.`);
      if (!isCompatible) {
        errors.push(`simpleBinding must reference a field in saveToList`);
      }
      const simpleBindingPath = dataModelBindings.simpleBinding?.field.split('.');
      const saveToListBinding = ctx.lookupBinding(dataModelBindings?.saveToList);

      // const simpleBinding = ctx.lookupBinding({
      //   dataType: dataModelBindings.simpleBinding.dataType,
      //   field: simpleBindingPath.join('[0].'),
      // });

      const items = saveToListBinding[0]?.items;
      const properties =
        items && !Array.isArray(items) && typeof items === 'object' && 'properties' in items
          ? items.properties
          : undefined;
      if (!(properties && simpleBindingPath[1] in properties)) {
        errors.push(`The property ${simpleBindingPath[1]} must be present in saveToList`);
      }
    }

    return errors;
  }
}
