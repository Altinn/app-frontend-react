import React, { forwardRef } from 'react';

import type { PropsFromGenericComponent } from '..';

import { TabsDef } from 'src/layout/Tabs/config.def.generated';
import { TabsHierarchyGenerator } from 'src/layout/Tabs/hierarchy';
import { SummaryTabsComponent } from 'src/layout/Tabs/SummaryTabsComponent';
import { Tabs as TabsComponent } from 'src/layout/Tabs/Tabs';
import type { SummaryRendererProps } from 'src/layout/LayoutComponent';
import type { CompTabsInternal } from 'src/layout/Tabs/config.generated';
import type { ComponentHierarchyGenerator } from 'src/utils/layout/HierarchyGenerator';
import type { BaseLayoutNode } from 'src/utils/layout/LayoutNode';

export class Tabs extends TabsDef {
  private _hierarchyGenerator = new TabsHierarchyGenerator();

  render = forwardRef<HTMLElement, PropsFromGenericComponent<'Tabs'>>(
    function LayoutComponentTabsRender(props, _): JSX.Element | null {
      return <TabsComponent {...props} />;
    },
  );

  hierarchyGenerator(): ComponentHierarchyGenerator<'Tabs'> {
    return this._hierarchyGenerator;
  }

  renderSummary(props: SummaryRendererProps<'Tabs'>): JSX.Element | null {
    return <SummaryTabsComponent {...props} />;
  }

  renderSummaryBoilerplate(): boolean {
    return false;
  }

  shouldRenderInAutomaticPDF(node: BaseLayoutNode<CompTabsInternal, 'Tabs'>): boolean {
    return !node.item.renderAsSummary;
  }

  getDisplayData(): string {
    return '';
  }

  public validateDataModelBindings(): string[] {
    return [];
  }
}
