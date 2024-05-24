import React, { forwardRef } from 'react';

import { Tabs } from '@digdir/designsystemet-react';

import type { PropsFromGenericComponent } from '..';

import { useLanguage } from 'src/features/language/useLanguage';
import { GenericComponent } from 'src/layout/GenericComponent';
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
  const { lang } = useLanguage();
  const children = node.item.childComponents;

  return (
    <Tabs defaultValue={children.at(0)?.item.id}>
      <Tabs.List>
        {children.map((n) => {
          const text = lang(n.item.textResourceBindings?.['title']);

          return (
            <Tabs.Tab
              key={n.item.id}
              value={n.item.id}
            >
              {text}
            </Tabs.Tab>
          );
        })}
      </Tabs.List>
      {children.map((n) => (
        <GenericComponent
          key={n.item.id}
          node={n}
        />
      ))}
    </Tabs>
  );
}

// FIXME: Implement SummaryTabGroupComponent
function SummaryTabGroupComponent(props: SummaryRendererProps<'TabGroup'>) {
  return <div>Summary</div>;
}
