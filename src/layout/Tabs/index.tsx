import React, { forwardRef, type JSX } from 'react';

import type { PropsFromGenericComponent } from '..';

import { SummaryComponent } from 'src/layout/Summary/SummaryComponent';
import { TabsDef } from 'src/layout/Tabs/config.def.generated';
import { Tabs as TabsComponent } from 'src/layout/Tabs/Tabs';
import type { SummaryRendererProps } from 'src/layout/LayoutComponent';
import type { LayoutNode } from 'src/utils/layout/LayoutNode';

export class Tabs extends TabsDef {
  render = forwardRef<HTMLElement, PropsFromGenericComponent<'Tabs'>>(
    function LayoutComponentTabsRender(props, _): JSX.Element | null {
      return <TabsComponent {...props} />;
    },
  );

  renderSummary({ summaryNode, targetNode, overrides }: SummaryRendererProps<'Tabs'>): JSX.Element | null {
    const children = targetNode.item.tabsInternal.map((card) => card.childNodes).flat();

    return (
      <>
        {children.map((child) => (
          <SummaryComponent
            key={child.item.id}
            summaryNode={summaryNode}
            overrides={{
              ...overrides,
              targetNode: child,
              grid: {},
              largeGroup: true,
            }}
          />
        ))}
      </>
    );
  }

  renderSummaryBoilerplate(): boolean {
    return false;
  }

  shouldRenderInAutomaticPDF(node: LayoutNode<'Tabs'>): boolean {
    return !node.item.renderAsSummary;
  }

  getDisplayData(): string {
    return '';
  }

  public validateDataModelBindings(): string[] {
    return [];
  }
}
