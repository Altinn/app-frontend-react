import React from 'react';
import type { JSX } from 'react';

import { addValidation, FrontendValidationSource, initializeComponentValidations } from 'src/features/validation';
import { ListDef } from 'src/layout/List/config.def.generated';
import { ListComponent } from 'src/layout/List/ListComponent';
import { SummaryItemSimple } from 'src/layout/Summary/SummaryItemSimple';
import { getFieldName } from 'src/utils/formComponentUtils';
import type { LayoutValidationCtx } from 'src/features/devtools/layoutValidation/types';
import type { FormValidations } from 'src/features/validation/types';
import type { PropsFromGenericComponent } from 'src/layout';
import type { SummaryRendererProps } from 'src/layout/LayoutComponent';
import type { LayoutNode } from 'src/utils/layout/LayoutNode';
import type { IValidationContext } from 'src/utils/validation/types';

export class List extends ListDef {
  render(props: PropsFromGenericComponent<'List'>): JSX.Element | null {
    return <ListComponent {...props} />;
  }

  getDisplayData(node: LayoutNode<'List'>): string {
    const formData = node.getFormData();
    const dmBindings = node.item.dataModelBindings;
    for (const [key, binding] of Object.entries(dmBindings || {})) {
      if (binding == node.item.bindingToShowInSummary) {
        return formData[key] || '';
      }
    }

    return '';
  }

  renderSummary({ targetNode }: SummaryRendererProps<'List'>): JSX.Element | null {
    const displayData = this.useDisplayData(targetNode);
    return <SummaryItemSimple formDataAsString={displayData} />;
  }

  runEmptyFieldValidation(node: LayoutNode<'List'>, { formData, langTools }: IValidationContext): FormValidations {
    if (!node.item.required || !node.item.dataModelBindings) {
      return {};
    }

    const fields = Object.values(node.item.dataModelBindings);

    /**
     * Initialize validation group for component,
     * this must be done so we remove existing validations in case they are fixed.
     */
    const formValidations: FormValidations = {};
    initializeComponentValidations(formValidations, node.item.id, FrontendValidationSource.Required);

    const { langAsString } = langTools;
    const textResourceBindings = node.item.textResourceBindings;

    let listHasErrors = false;
    for (const field of fields) {
      const data = formData[field as string];

      if (!data?.length) {
        listHasErrors = true;
      }
    }
    if (listHasErrors) {
      const fieldName = getFieldName(node.item.textResourceBindings, langTools, undefined);
      const message = textResourceBindings?.requiredValidation
        ? langAsString(textResourceBindings?.requiredValidation, [fieldName])
        : langAsString('form_filler.error_required', [fieldName]);
      addValidation(formValidations, {
        message,
        severity: 'errors',
        componentId: node.item.id,
        group: FrontendValidationSource.Required,
      });
    }
    return formValidations;
  }

  validateDataModelBindings(ctx: LayoutValidationCtx<'List'>): string[] {
    const possibleBindings = Object.keys(ctx.node.item.tableHeaders || {});

    const errors: string[] = [];
    for (const binding of possibleBindings) {
      if (possibleBindings.includes(binding)) {
        const [newErrors] = this.validateDataModelBindingsAny(
          ctx,
          binding,
          ['string', 'number', 'integer', 'boolean'],
          false,
        );
        errors.push(...(newErrors || []));
      } else {
        errors.push(
          `Bindingen ${binding} er ikke gyldig for denne komponenten. Gyldige bindinger er definert i 'tableHeaders'`,
        );
      }
    }

    return errors;
  }
}
