import type { ForwardRefExoticComponent, JSX, RefAttributes } from 'react';

import type { PropsFromGenericComponent } from '..';

import { OrganisationLookupDef } from 'src/layout/OrganisationLookup/config.def.generated';
import type { LayoutValidationCtx } from 'src/features/devtools/layoutValidation/types';
import type { DisplayDataProps } from 'src/features/displayData';
import type { SummaryRendererProps } from 'src/layout/LayoutComponent';
import type { BaseLayoutNode } from 'src/utils/layout/LayoutNode';

export class OrganisationLookup extends OrganisationLookupDef {
  validateDataModelBindings(ctx: LayoutValidationCtx<'OrganisationLookup'>): string[] {
    throw new Error('Method not implemented.');
  }
  getDisplayData(node: BaseLayoutNode<'OrganisationLookup'>, displayDataProps: DisplayDataProps): string {
    throw new Error('Method not implemented.');
  }
  renderSummary(props: SummaryRendererProps<'OrganisationLookup'>): JSX.Element | null {
    throw new Error('Method not implemented.');
  }
  render:
    | ForwardRefExoticComponent<PropsFromGenericComponent<'OrganisationLookup'> & RefAttributes<HTMLElement>>
    | ((props: PropsFromGenericComponent<'OrganisationLookup'>) => JSX.Element | null);
}
