import React from 'react';
import type { JSX } from 'react';

import { addValidationToField, FrontendValidationSource, initializeValidationField } from 'src/features/validation';
import { AddressComponent } from 'src/layout/Address/AddressComponent';
import { AddressDef } from 'src/layout/Address/config.def.generated';
import { SummaryItemSimple } from 'src/layout/Summary/SummaryItemSimple';
import type { LayoutValidationCtx } from 'src/features/devtools/layoutValidation/types';
import type { IFormData } from 'src/features/formData';
import type { FieldValidations } from 'src/features/validation/types';
import type { ComponentValidation, PropsFromGenericComponent } from 'src/layout';
import type { SummaryRendererProps } from 'src/layout/LayoutComponent';
import type { LayoutNode } from 'src/utils/layout/LayoutNode';
import type { IValidationContext } from 'src/utils/validation/types';

export class Address extends AddressDef implements ComponentValidation {
  render(props: PropsFromGenericComponent<'AddressComponent'>): JSX.Element | null {
    return <AddressComponent {...props} />;
  }

  getDisplayData(node: LayoutNode<'AddressComponent'>): string {
    const data = node.getFormData();
    return Object.values(data).join(' ');
  }

  renderSummary({ targetNode }: SummaryRendererProps<'AddressComponent'>): JSX.Element | null {
    const data = this.useDisplayData(targetNode);
    return <SummaryItemSimple formDataAsString={data} />;
  }

  renderDefaultValidations(): boolean {
    return false;
  }

  runComponentValidation(
    node: LayoutNode<'AddressComponent'>,
    { formData, langTools }: IValidationContext,
    overrideFormData?: IFormData,
  ): FieldValidations {
    if (!node.item.dataModelBindings) {
      return {};
    }
    const formDataToValidate = { ...formData, ...overrideFormData };
    const fieldValidations: FieldValidations = {};

    /**
     * Initialize validation group for fields,
     * this must be done for all fields that will be validated
     * so we remove existing validations in case they are fixed.
     */
    for (const field of Object.values(node.item.dataModelBindings)) {
      initializeValidationField(fieldValidations, field, FrontendValidationSource.Component);
    }

    const zipCodeField = node.item.dataModelBindings.zipCode;
    const zipCode = zipCodeField ? formDataToValidate[zipCodeField] : undefined;

    // TODO(Validation): Add better message for the special case of 0000 or add better validation for zipCodes that the API says are invalid
    if (zipCode && (!zipCode.match(/^\d{4}$/) || zipCode === '0000')) {
      addValidationToField(fieldValidations, {
        message: langTools.langAsString('address_component.validation_error_zipcode'),
        severity: 'errors',
        field: zipCodeField!,
        group: FrontendValidationSource.Component,
      });
    }

    const houseNumberField = node.item.dataModelBindings.houseNumber;
    const houseNumber = houseNumberField ? formDataToValidate[houseNumberField] : undefined;

    if (houseNumber && !houseNumber.match(/^[a-z,A-Z]\d{4}$/)) {
      addValidationToField(fieldValidations, {
        message: langTools.langAsString('address_component.validation_error_house_number'),
        severity: 'errors',
        field: houseNumberField!,
        group: FrontendValidationSource.Component,
      });
    }

    return fieldValidations;
  }

  validateDataModelBindings(ctx: LayoutValidationCtx<'AddressComponent'>): string[] {
    const errors: string[] = [
      ...(this.validateDataModelBindingsAny(ctx, 'address', ['string'])[0] || []),
      ...(this.validateDataModelBindingsAny(ctx, 'zipCode', ['string', 'number', 'integer'])[0] || []),
      ...(this.validateDataModelBindingsAny(ctx, 'postPlace', ['string'])[0] || []),
    ];

    if (ctx.node.item.simplified === false) {
      errors.push(...(this.validateDataModelBindingsAny(ctx, 'careOf', ['string'])[0] || []));
      errors.push(...(this.validateDataModelBindingsAny(ctx, 'houseNumber', ['string', 'number', 'integer'])[0] || []));
    } else {
      const hasCareOf = ctx.node.item.dataModelBindings?.careOf;
      const hasHouseNumber = ctx.node.item.dataModelBindings?.houseNumber;
      if (hasCareOf) {
        errors.push(`Datamodellbindingen 'careOf' støttes ikke for en forenklet adresse-komponent`);
      }
      if (hasHouseNumber) {
        errors.push(`Datamodellbindingen 'houseNumber' støttes ikke for en forenklet adresse-komponent`);
      }
    }

    return errors;
  }
}
