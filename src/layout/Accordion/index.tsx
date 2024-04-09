import React, { forwardRef } from 'react';

import { Accordion as AccordionComponent } from 'src/layout/Accordion/Accordion';
import { AccordionDef } from 'src/layout/Accordion/config.def.generated';
import { SummaryAccordionComponent } from 'src/layout/Accordion/SummaryAccordion';
import type { LayoutValidationCtx } from 'src/features/devtools/layoutValidation/types';
import type { DisplayDataProps } from 'src/features/displayData';
import type { PropsFromGenericComponent } from 'src/layout';
import type { CompInternal } from 'src/layout/layout';
import type { ChildClaimerProps, SummaryRendererProps } from 'src/layout/LayoutComponent';
import type { BaseLayoutNode } from 'src/utils/layout/LayoutNode';

export class Accordion extends AccordionDef {
  claimChildren(props: ChildClaimerProps<'Accordion'>): void {
    throw new Error('Method not implemented.');
  }
  getDisplayData(
    node: BaseLayoutNode<'Accordion'>,
    item: CompInternal<'Accordion'>,
    displayDataProps: DisplayDataProps,
  ): string {
    throw new Error('Method not implemented.');
  }
  public validateDataModelBindings(ctx: LayoutValidationCtx<'Accordion'>): string[] {
    throw new Error('Method not implemented.');
  }
  render = forwardRef<HTMLElement, PropsFromGenericComponent<'Accordion'>>(
    function LayoutComponentAccordionRender(props, _): React.JSX.Element | null {
      return <AccordionComponent {...props} />;
    },
  );

  renderSummary(props: SummaryRendererProps<'Accordion'>): React.JSX.Element | null {
    return <SummaryAccordionComponent {...props} />;
  }

  renderSummaryBoilerplate(): boolean {
    return false;
  }
}
