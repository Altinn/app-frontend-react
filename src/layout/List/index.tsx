import React, { forwardRef } from 'react';
import type { JSX } from 'react';

import { useDataModelBindings } from 'src/features/formData/useDataModelBindings';
import { evalQueryParameters } from 'src/features/options/evalQueryParameters';
import { FrontendValidationSource, ValidationMask } from 'src/features/validation';
import { ListDef } from 'src/layout/List/config.def.generated';
import { ListComponent } from 'src/layout/List/ListComponent';
import { SummaryListGroup } from 'src/layout/List/Summary/ListSummary';
import { ListSummary } from 'src/layout/List/Summary2/ListSummary';
import { SummaryItemSimple } from 'src/layout/Summary/SummaryItemSimple';
import { getFieldNameKey } from 'src/utils/formComponentUtils';
import { useNodeItem } from 'src/utils/layout/useNodeItem';
import type { LayoutValidationCtx } from 'src/features/devtools/layoutValidation/types';
import type { DisplayDataProps } from 'src/features/displayData';
import type { ComponentValidation, ValidationDataSources } from 'src/features/validation';
import type { PropsFromGenericComponent } from 'src/layout';
import type { ExprResolver, SummaryRendererProps } from 'src/layout/LayoutComponent';
import type { Summary2Props } from 'src/layout/Summary2/SummaryComponent2/types';
import type { LayoutNode } from 'src/utils/layout/LayoutNode';

export class List extends ListDef {
  render = forwardRef<HTMLElement, PropsFromGenericComponent<'List'>>(
    function LayoutComponentListRender(props, _): JSX.Element | null {
      return <ListComponent {...props} />;
    },
  );

  getDisplayData(node: LayoutNode<'List'>, { nodeFormDataSelector, nodeDataSelector }: DisplayDataProps): string {
    const formData = nodeFormDataSelector(node);
    const dmBindings = nodeDataSelector((picker) => picker(node)?.layout.dataModelBindings, [node]);
    const summaryBinding = nodeDataSelector((picker) => picker(node)?.item?.summaryBinding, [node]);
    const legacySummaryBinding = nodeDataSelector((picker) => picker(node)?.item?.bindingToShowInSummary, [node]);

    if (summaryBinding && dmBindings) {
      return formData[summaryBinding] ?? '';
    } else if (legacySummaryBinding && dmBindings) {
      for (const [key, binding] of Object.entries(dmBindings)) {
        if (binding.field === legacySummaryBinding) {
          return formData[key] ?? '';
        }
      }
    }

    return '';
  }

  renderSummary(props: SummaryRendererProps<'List'>): JSX.Element | null {
    const { dataModelBindings } = useNodeItem(props.targetNode);
    const { formData } = useDataModelBindings(dataModelBindings, 1, 'raw');
    if (formData.saveToList != null) {
      return <SummaryListGroup {...props} />;
    } else {
      const displayData = this.useDisplayData(props.targetNode);
      return <SummaryItemSimple formDataAsString={displayData} />;
    }
  }

  renderSummary2(props: Summary2Props<'List'>): JSX.Element | null {
    return (
      <ListSummary
        componentNode={props.target}
        isCompact={props.isCompact}
        emptyFieldText={props.override?.emptyFieldText}
      />
    );
  }

  runEmptyFieldValidation(
    node: LayoutNode<'List'>,
    { formDataSelector, invalidDataSelector, nodeDataSelector }: ValidationDataSources,
  ): ComponentValidation[] {
    const required = nodeDataSelector(
      (picker) => {
        const item = picker(node)?.item;
        return item && 'required' in item ? item.required : false;
      },
      [node],
    );
    const dataModelBindings = nodeDataSelector((picker) => picker(node)?.layout.dataModelBindings, [node]);
    if (!required || !dataModelBindings) {
      return [];
    }

    const references = Object.values(dataModelBindings);
    const validations: ComponentValidation[] = [];
    const textResourceBindings = nodeDataSelector((picker) => picker(node)?.item?.textResourceBindings, [node]);

    let listHasErrors = false;
    for (const reference of references) {
      const data = formDataSelector(reference) ?? invalidDataSelector(reference);
      const dataAsString =
        typeof data === 'string' || typeof data === 'number' || typeof data === 'boolean' ? String(data) : undefined;

      if (!dataAsString?.length) {
        listHasErrors = true;
      }
    }
    if (listHasErrors) {
      const key = textResourceBindings?.requiredValidation
        ? textResourceBindings?.requiredValidation
        : 'form_filler.error_required';

      const fieldNameReference = {
        key: getFieldNameKey(textResourceBindings, undefined),
        makeLowerCase: true,
      };

      validations.push({
        message: {
          key,
          params: [fieldNameReference],
        },
        severity: 'error',
        source: FrontendValidationSource.EmptyField,
        category: ValidationMask.Required,
      });
    }
    return validations;
  }

  validateDataModelBindings(ctx: LayoutValidationCtx<'List'>): string[] {
    const errors: string[] = [];

    // for (const [binding, bindingConfig] of Object.entries(ctx.item.dataModelBindings ?? {})) {
    //   const allowedTypes = binding == 'saveToList' ? ['array'] : ['string', 'number', 'integer', 'boolean', 'array'];
    //   const [newErrors] = this.validateDataModelBindingsAny(ctx, binding, allowedTypes, false);
    //   errors.push(...(newErrors || []));
    // }
    return errors;
  }

  evalExpressions(props: ExprResolver<'List'>) {
    return {
      ...this.evalDefaultExpressions(props),
      queryParameters: evalQueryParameters(props),
    };
  }
}
