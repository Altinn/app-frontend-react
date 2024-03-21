import React, { forwardRef } from 'react';
import type { JSX } from 'react';

import { AccordionGroup as AccordionGroupComponent } from 'src/layout/AccordionGroup/AccordionGroup';
import { AccordionGroupDef } from 'src/layout/AccordionGroup/config.def.generated';
import { SummaryAccordionGroupComponent } from 'src/layout/AccordionGroup/SummaryAccordionGroupComponent';
import { DefaultNodeGenerator } from 'src/utils/layout/DefaultNodeGenerator';
import type { NodeRef, PropsFromGenericComponent } from 'src/layout';
import type {
  ChildClaimerProps,
  ExprResolver,
  NodeGeneratorProps,
  SummaryRendererProps,
} from 'src/layout/LayoutComponent';
import type { LayoutNode } from 'src/utils/layout/LayoutNode';

export class AccordionGroup extends AccordionGroupDef {
  render = forwardRef<HTMLElement, PropsFromGenericComponent<'AccordionGroup'>>(
    function LayoutComponentAccordionGroupRender(props, _): JSX.Element | null {
      return <AccordionGroupComponent {...props} />;
    },
  );

  claimChildren({ claimChild, item, getProto }: ChildClaimerProps<'AccordionGroup'>): void {
    for (const childId of item.children) {
      const proto = getProto(childId);
      if (!proto) {
        continue;
      }
      if (!proto.def.canRenderInAccordionGroup()) {
        window.logWarn(
          `Accordion component included a component '${childId}', which ` +
            `is a '${proto.type}' and cannot be rendered in an Accordion.`,
        );
        continue;
      }

      claimChild(childId);
    }
  }

  renderNodeGenerator(props: NodeGeneratorProps<'AccordionGroup'>): JSX.Element | null {
    // TODO: Implement custom node generator
    return <DefaultNodeGenerator {...props} />;
  }

  evalExpressions({ item, evalTrb, evalCommon }: ExprResolver<'AccordionGroup'>) {
    return {
      ...item,
      ...evalCommon(),
      ...evalTrb(),

      // TODO: Implement
      childComponents: [] as NodeRef[],
    };
  }

  renderSummary(props: SummaryRendererProps<'AccordionGroup'>): JSX.Element | null {
    return <SummaryAccordionGroupComponent {...props} />;
  }

  renderSummaryBoilerplate(): boolean {
    return false;
  }

  shouldRenderInAutomaticPDF(node: LayoutNode<'AccordionGroup'>): boolean {
    return !node.item.renderAsSummary;
  }

  getDisplayData(): string {
    return '';
  }

  validateDataModelBindings(): string[] {
    return [];
  }
}
