import React, { forwardRef } from 'react';

import { Tabs } from '@digdir/designsystemet-react';

import type { PropsFromGenericComponent } from '..';

import { TabGroupDef } from 'src/layout/TabGroup/config.def.generated';
import { TabGroupHierarchyGenerator } from 'src/layout/TabGroup/hierarchy';
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

function TabGroupComponent({ node }: PropsFromGenericComponent<'TabGroup'>) {
  console.log({ tabGroupNode: node });

  console.log({ childComponents: node.item.childComponents });
  console.log({ children: node.item['children'] });

  const children = node.item.childComponents;

  return (
    // TODO:
    <Tabs defaultValue={children.at(0)?.item.id}>
      <Tabs.List>
        {children.map((n, i) => (
          <Tabs.Tab
            key={n.item.id}
            value={n.item.id}
          >
            {/* TODO: use textresourcebinding */}
            Tab {i + 1}
          </Tabs.Tab>
        ))}
      </Tabs.List>
      {children.map((n, i) => (
        <Tabs.Content
          key={n.item.id}
          value={n.item.id}
        >
          {/* TODO: use textresourcebinding */}
          Content {i + 1}
        </Tabs.Content>
      ))}
    </Tabs>
  );
}

function SummaryTabGroupComponent(props: SummaryRendererProps<'TabGroup'>) {
  return <div>Summary</div>;
}
