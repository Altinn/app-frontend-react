import React, { forwardRef } from 'react';
import type { JSX } from 'react';

import {
  type ComponentValidation,
  FrontendValidationSource,
  type ValidationDataSources,
  ValidationMask,
} from 'src/features/validation';
import { PersonLookupDef } from 'src/layout/PersonLookup/config.def.generated';
import { PersonLookupComponent } from 'src/layout/PersonLookup/PersonLookupComponent';
import type { LayoutValidationCtx } from 'src/features/devtools/layoutValidation/types';
import type { DisplayDataProps } from 'src/features/displayData';
import type { PropsFromGenericComponent, ValidateComponent } from 'src/layout';
import type { SummaryRendererProps } from 'src/layout/LayoutComponent';
import type { BaseLayoutNode } from 'src/utils/layout/LayoutNode';

export class PersonLookup extends PersonLookupDef implements ValidateComponent<'PersonLookup'> {
  getDisplayData(node: BaseLayoutNode<'PersonLookup'>, displayDataProps: DisplayDataProps): string {
    throw new Error('Method not implemented.');
  }

  render = forwardRef<HTMLElement, PropsFromGenericComponent<'PersonLookup'>>(
    function LayoutComponentPersonLookupRender(props, _): JSX.Element | null {
      return <PersonLookupComponent {...props} />;
    },
  );

  renderSummary(props: SummaryRendererProps<'PersonLookup'>): JSX.Element | null {
    throw new Error('Method not implemented.');
  }

  renderDefaultValidations(): boolean {
    return false;
  }

  runComponentValidation(
    node: BaseLayoutNode<'PersonLookup'>,
    { formDataSelector, nodeDataSelector }: ValidationDataSources,
  ): ComponentValidation[] {
    const dataModelBindings = nodeDataSelector((picker) => picker(node)?.layout.dataModelBindings, [node]);
    if (!dataModelBindings) {
      return [];
    }

    const validations: ComponentValidation[] = [];

    const ssnField = dataModelBindings.person_lookup_ssn
      ? formDataSelector(dataModelBindings.person_lookup_ssn)
      : undefined;
    const ssn = typeof ssnField === 'string' || typeof ssnField === 'number' ? String(ssnField) : '';
    const nameField = dataModelBindings.person_lookup_name
      ? formDataSelector(dataModelBindings.person_lookup_name)
      : '';
    const name = typeof nameField === 'string' ? String(nameField) : '';

    if (name && name.length < 2) {
      validations.push({
        message: { key: 'person_lookup.validation_error_name_too_short' },
        severity: 'error',
        bindingKey: 'name',
        source: FrontendValidationSource.Component,
        category: ValidationMask.Component,
      });
    }

    const matchesFNR = REGEX_FNR.test(ssn);
    const matchesDNR = REGEX_DNR.test(ssn);

    if (ssn && !matchesFNR && !matchesDNR) {
      validations.push({
        message: { key: 'person_lookup.validation_error_ssn' },
        severity: 'error',
        bindingKey: 'ssn',
        source: FrontendValidationSource.Component,
        category: ValidationMask.Component,
      });
    }

    return validations;
  }

  validateDataModelBindings(ctx: LayoutValidationCtx<'PersonLookup'>): string[] {
    const ssnErrors = this.validateDataModelBindingsAny(ctx, 'person_lookup_ssn', ['integer', 'string'], true)[0] ?? [];
    const nameErrors = this.validateDataModelBindingsAny(ctx, 'person_lookup_name', ['string'], true)[0] ?? [];

    return [...ssnErrors, ...nameErrors];
  }
}

/**
 * @see https://github.com/navikt/k9-punsj-frontend/blob/435a445a14797dee5c19fb1c1a70c323c3f4187c/src/app/rules/IdentRules.ts
 */
const REGEX_FNR =
  /^((((0[1-9]|[12]\d|30)(0[469]|11)|(0[1-9]|[12]\d|3[01])(0[13578]|1[02])|((0[1-9]|1\d|2[0-8])02))\d{2})|2902([02468][048]|[13579][26]))\d{5}$/;
/**
 * @see https://github.com/navikt/k9-punsj-frontend/blob/435a445a14797dee5c19fb1c1a70c323c3f4187c/src/app/rules/IdentRules.ts
 */
const REGEX_DNR =
  /^((((4[1-9]|[56]\d|70)(0[469]|11)|(4[1-9]|[56]\d|7[01])(0[13578]|1[02])|((4[1-9]|5\d|6[0-8])02))\d{2})|6902([02468][048]|[13579][26]))\d{5}$/;
