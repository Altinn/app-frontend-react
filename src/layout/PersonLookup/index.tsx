import React, { forwardRef } from 'react';
import type { JSX } from 'react';

import { PersonLookupDef } from 'src/layout/PersonLookup/config.def.generated';
import { PersonLookupComponent } from 'src/layout/PersonLookup/PersonLookupComponent';
import type { LayoutValidationCtx } from 'src/features/devtools/layoutValidation/types';
import type { DisplayDataProps } from 'src/features/displayData';
import type { PropsFromGenericComponent } from 'src/layout';
import type { SummaryRendererProps } from 'src/layout/LayoutComponent';
import type { LayoutNode } from 'src/utils/layout/LayoutNode';

export class PersonLookup extends PersonLookupDef {
  getDisplayData(node: LayoutNode<'PersonLookup'>, { nodeFormDataSelector }: DisplayDataProps): string {
    const data = nodeFormDataSelector(node);
    return Object.values(data).join(', ');
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

  validateDataModelBindings(ctx: LayoutValidationCtx<'PersonLookup'>): string[] {
    const ssnErrors = this.validateDataModelBindingsAny(ctx, 'person_lookup_ssn', ['integer', 'string'], true)[0] ?? [];
    const nameErrors = this.validateDataModelBindingsAny(ctx, 'person_lookup_name', ['string'], true)[0] ?? [];

    return [...ssnErrors, ...nameErrors];
  }
}
