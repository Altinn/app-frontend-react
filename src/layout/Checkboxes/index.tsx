import React, { forwardRef } from 'react';
import type { JSX } from 'react';

import { useLanguage } from 'src/features/language/useLanguage';
import { getCommaSeparatedOptionsToText } from 'src/features/options/getCommaSeparatedOptionsToText';
import { useNodeOptions } from 'src/features/options/useNodeOptions';
import { useEmptyFieldValidationOnlySimpleBinding } from 'src/features/validation/nodeValidation/emptyFieldValidation';
import { CheckboxContainerComponent } from 'src/layout/Checkboxes/CheckboxesContainerComponent';
import { CheckboxesLayoutValidator } from 'src/layout/Checkboxes/CheckboxesLayoutValidator';
import { CheckboxesSummary } from 'src/layout/Checkboxes/CheckboxesSummary';
import { CheckboxesDef } from 'src/layout/Checkboxes/config.def.generated';
import { MultipleChoiceSummary } from 'src/layout/Checkboxes/MultipleChoiceSummary';
import { useNodeFormDataWhenType } from 'src/utils/layout/useNodeItem';
import type { LayoutValidationCtx } from 'src/features/devtools/layoutValidation/types';
import type { ComponentValidation } from 'src/features/validation';
import type { PropsFromGenericComponent } from 'src/layout';
import type { NodeValidationProps } from 'src/layout/layout';
import type { SummaryRendererProps } from 'src/layout/LayoutComponent';
import type { CheckboxSummaryOverrideProps } from 'src/layout/Summary2/config.generated';
import type { Summary2Props } from 'src/layout/Summary2/SummaryComponent2/types';
import type { LayoutNode } from 'src/utils/layout/LayoutNode';

export class Checkboxes extends CheckboxesDef {
  render = forwardRef<HTMLElement, PropsFromGenericComponent<'Checkboxes'>>(
    function LayoutComponentCheckboxesRender(props, _): JSX.Element | null {
      return <CheckboxContainerComponent {...props} />;
    },
  );

  useDisplayData(nodeId: string): string {
    const formData = useNodeFormDataWhenType(nodeId, 'Checkboxes');
    const options = useNodeOptions(nodeId).options;
    const langAsString = useLanguage().langAsString;
    const data = getCommaSeparatedOptionsToText(formData?.simpleBinding, options, langAsString);
    return Object.values(data).join(', ');
  }

  renderSummary({ targetNode }: SummaryRendererProps<'Checkboxes'>): JSX.Element | null {
    return <MultipleChoiceSummary targetNode={targetNode} />;
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

  useEmptyFieldValidation(node: LayoutNode<'Checkboxes'>): ComponentValidation[] {
    return useEmptyFieldValidationOnlySimpleBinding(node);
  }

  renderLayoutValidators(props: NodeValidationProps<'Checkboxes'>): JSX.Element | null {
    return <CheckboxesLayoutValidator {...props} />;
  }

  validateDataModelBindings(ctx: LayoutValidationCtx<'Checkboxes'>): string[] {
    const errors: string[] = [];
    const allowedTypes = ['string', 'boolean', 'number', 'integer'];

    const dataModelBindings = ctx.item.dataModelBindings ?? {};

    if (!dataModelBindings?.group) {
      for (const [binding] of Object.entries(dataModelBindings ?? {})) {
        const [newErrors] = this.validateDataModelBindingsAny(ctx, binding, allowedTypes, false);
        errors.push(...(newErrors || []));
      }
    }

    const [newErrors] = this.validateDataModelBindingsAny(ctx, 'group', ['array'], false);
    errors.push(...(newErrors || []));

    if (dataModelBindings?.group) {
      const isCompatible = dataModelBindings?.simpleBinding?.field.includes(`${dataModelBindings.group.field}.`);

      if (!isCompatible) {
        errors.push(`simpleBinding must reference a field in group`);
      }

      const simpleBindingPath = dataModelBindings.simpleBinding?.field.split('.');
      const groupBinding = ctx.lookupBinding(dataModelBindings?.group);
      const items = groupBinding[0]?.items;
      const properties =
        items && !Array.isArray(items) && typeof items === 'object' && 'properties' in items
          ? items.properties
          : undefined;

      if (!(properties && simpleBindingPath[1] in properties)) {
        errors.push(`The property ${simpleBindingPath[1]} must be present in group`);
      }
    }

    return errors;
  }
}
