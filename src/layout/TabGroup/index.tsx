import React, { forwardRef } from 'react';

import type { PropsFromGenericComponent } from '..';

import { TabGroupDef } from 'src/layout/TabGroup/config.def.generated';
import { TabGroupHierarchyGenerator } from 'src/layout/TabGroup/hierarchy';
import { SummaryTabGroupComponent } from 'src/layout/TabGroup/SummaryTabGroupComponent';
import { TabGroup as TabGroupComponent } from 'src/layout/TabGroup/TabGroup';
import type { SummaryRendererProps } from 'src/layout/LayoutComponent';
import type { CompTabGroupInternal } from 'src/layout/TabGroup/config.generated';
import type { ComponentHierarchyGenerator } from 'src/utils/layout/HierarchyGenerator';
import type { BaseLayoutNode } from 'src/utils/layout/LayoutNode';

export class TabGroup extends TabGroupDef {
  private _hierarchyGenerator = new TabGroupHierarchyGenerator();

  render = forwardRef<HTMLElement, PropsFromGenericComponent<'TabGroup'>>(
    function LayoutComponentTabGroupRender(props, _): JSX.Element | null {
      return <TabGroupComponent {...props} />;
    },
  );

  hierarchyGenerator(): ComponentHierarchyGenerator<'TabGroup'> {
    return this._hierarchyGenerator;
  }

  renderSummary(props: SummaryRendererProps<'TabGroup'>): JSX.Element | null {
    return <SummaryTabGroupComponent {...props} />;
  }

  renderSummaryBoilerplate(): boolean {
    return false;
  }

  shouldRenderInAutomaticPDF(node: BaseLayoutNode<CompTabGroupInternal, 'TabGroup'>): boolean {
    return !node.item.renderAsSummary;
  }

  getDisplayData(): string {
    return '';
  }

  public validateDataModelBindings(): string[] {
    return [];
  }
}
