import React from 'react';
import type { JSX } from 'react';

import { FrontendValidationSource } from 'src/features/validation';
import { AddressComponent } from 'src/layout/Address/AddressComponent';
import { AddressDef } from 'src/layout/Address/config.def.generated';
import { SummaryItemSimple } from 'src/layout/Summary/SummaryItemSimple';
import type { LayoutValidationCtx } from 'src/features/devtools/layoutValidation/types';
import type { IFormData } from 'src/features/formData';
import type { ComponentValidation, IValidationContext } from 'src/features/validation';
import type { PropsFromGenericComponent, ValidateComponent } from 'src/layout';
import type { SummaryRendererProps } from 'src/layout/LayoutComponent';
import type { LayoutNode } from 'src/utils/layout/LayoutNode';

export class Address extends AddressDef implements ValidateComponent {
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
  ): ComponentValidation[] {
    if (!node.item.dataModelBindings) {
      return [];
    }
    const formDataToValidate = { ...formData, ...overrideFormData };
    const validations: ComponentValidation[] = [];

    const zipCodeField = node.item.dataModelBindings.zipCode;
    const zipCode = zipCodeField ? formDataToValidate[zipCodeField] : undefined;

    // TODO(Validation): Add better message for the special case of 0000 or add better validation for zipCodes that the API says are invalid
    if (zipCode && (!zipCode.match(/^\d{4}$/) || zipCode === '0000')) {
      validations.push({
        message: langTools.langAsString('address_component.validation_error_zipcode'),
        severity: 'errors',
        bindingKey: 'zipCode',
        componentId: node.item.id,
        group: FrontendValidationSource.Component,
      });
    }

    const houseNumberField = node.item.dataModelBindings.houseNumber;
    const houseNumber = houseNumberField ? formDataToValidate[houseNumberField] : undefined;

    if (houseNumber && !houseNumber.match(/^[a-z,A-Z]\d{4}$/)) {
      validations.push({
        message: langTools.langAsString('address_component.validation_error_house_number'),
        severity: 'errors',
        bindingKey: 'houseNumber',
        componentId: node.item.id,
        group: FrontendValidationSource.Component,
      });
    }

    return validations;
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
