import React, { forwardRef } from 'react';
import type { JSX } from 'react';

import { useLanguage } from 'src/features/language/useLanguage';
import { getCommaSeparatedOptionsToText } from 'src/features/options/getCommaSeparatedOptionsToText';
import { useNodeOptions } from 'src/features/options/useNodeOptions';
import { useEmptyFieldValidationOnlySimpleBinding } from 'src/features/validation/nodeValidation/emptyFieldValidation';
import { MultipleChoiceSummary } from 'src/layout/Checkboxes/MultipleChoiceSummary';
import { ObjectToGroupLayoutValidator } from 'src/layout/List/ObjectToGroupLayoutValidator';
import { MultipleSelectDef } from 'src/layout/MultipleSelect/config.def.generated';
import { MultipleSelectComponent } from 'src/layout/MultipleSelect/MultipleSelectComponent';
import { MultipleSelectSummary } from 'src/layout/MultipleSelect/MultipleSelectSummary';
import { useNodeFormDataWhenType } from 'src/utils/layout/useNodeItem';
import type { LayoutValidationCtx } from 'src/features/devtools/layoutValidation/types';
import type { ComponentValidation } from 'src/features/validation';
import type { PropsFromGenericComponent } from 'src/layout';
import type { NodeValidationProps } from 'src/layout/layout';
import type { SummaryRendererProps } from 'src/layout/LayoutComponent';
import type { Summary2Props } from 'src/layout/Summary2/SummaryComponent2/types';
import type { LayoutNode } from 'src/utils/layout/LayoutNode';

export class MultipleSelect extends MultipleSelectDef {
  render = forwardRef<HTMLElement, PropsFromGenericComponent<'MultipleSelect'>>(
    function LayoutComponentMultipleSelectRender(props, _): JSX.Element | null {
      return <MultipleSelectComponent {...props} />;
    },
  );

  useDisplayData(nodeId: string): string {
    const formData = useNodeFormDataWhenType(nodeId, 'MultipleSelect');
    const options = useNodeOptions(nodeId).options;
    const langAsString = useLanguage().langAsString;
    const data = getCommaSeparatedOptionsToText(formData?.simpleBinding, options, langAsString);
    return Object.values(data).join(', ');
  }

  renderSummary({ targetNode }: SummaryRendererProps<'MultipleSelect'>): JSX.Element | null {
    return <MultipleChoiceSummary targetNode={targetNode} />;
  }

  renderSummary2(props: Summary2Props<'MultipleSelect'>): JSX.Element | null {
    return (
      <MultipleSelectSummary
        componentNode={props.target}
        summaryOverride={props.override}
        isCompact={props.isCompact}
        emptyFieldText={props.override?.emptyFieldText}
      />
    );
  }

  useEmptyFieldValidation(node: LayoutNode<'MultipleSelect'>): ComponentValidation[] {
    return useEmptyFieldValidationOnlySimpleBinding(node);
  }

  renderLayoutValidators(props: NodeValidationProps<'MultipleSelect'>): JSX.Element | null {
    return <ObjectToGroupLayoutValidator {...props} />;
  }

  validateDataModelBindings(ctx: LayoutValidationCtx<'MultipleSelect'>): string[] {
    const errors: string[] = [];
    const dataModelBindings = ctx.item.dataModelBindings ?? {};

    if (!dataModelBindings?.group) {
      const [newErrors] = this.validateDataModelBindingsSimple(ctx);
      errors.push(...(newErrors || []));
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
