import React, { forwardRef } from 'react';

import { Accordion as AccordionComponent } from 'src/layout/Accordion/Accordion';
import { AccordionDef } from 'src/layout/Accordion/config.def.generated';
import { AccordionHierarchyGenerator } from 'src/layout/Accordion/hierarchy';
import { SummaryAccordionComponent } from 'src/layout/Accordion/SummaryAccordion';
import type { PropsFromGenericComponent } from 'src/layout';
import type { CompInternal } from 'src/layout/layout';
import type { ExprResolver, SummaryRendererProps } from 'src/layout/LayoutComponent';
import type { ComponentHierarchyGenerator } from 'src/utils/layout/HierarchyGenerator';

export class Accordion extends AccordionDef {
  private _hierarchyGenerator = new AccordionHierarchyGenerator();

  render = forwardRef<HTMLElement, PropsFromGenericComponent<'Accordion'>>(
    function LayoutComponentAccordionRender(props, _): React.JSX.Element | null {
      return <AccordionComponent {...props} />;
    },
  );

  evalExpressions({ item, evalTrb, evalCommon }: ExprResolver<'Accordion'>): CompInternal<'Accordion'> {
    return {
      ...item,
      ...evalCommon(item),
      ...evalTrb(item),
    };
  }

  hierarchyGenerator(): ComponentHierarchyGenerator<'Accordion'> {
    return this._hierarchyGenerator;
  }

  renderSummary(props: SummaryRendererProps<'Accordion'>): React.JSX.Element | null {
    return <SummaryAccordionComponent {...props} />;
  }

  renderSummaryBoilerplate(): boolean {
    return false;
  }
}
