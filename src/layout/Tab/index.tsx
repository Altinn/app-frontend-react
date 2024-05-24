import React, { forwardRef } from 'react';

import { Tabs } from '@digdir/designsystemet-react';

import type { PropsFromGenericComponent } from '..';

import { GenericComponent } from 'src/layout/GenericComponent';
import { TabDef } from 'src/layout/Tab/config.def.generated';
import { TabHierarchyGenerator } from 'src/layout/Tab/hierarchy';
import type { ComponentHierarchyGenerator } from 'src/utils/layout/HierarchyGenerator';

export class Tab extends TabDef {
  private _hierarchyGenerator = new TabHierarchyGenerator();

  render = forwardRef<HTMLElement, PropsFromGenericComponent<'Tab'>>(
    function LayoutComponentTabRender(props, _): JSX.Element | null {
      return <TabComponent {...props} />;
    },
  );

  hierarchyGenerator(): ComponentHierarchyGenerator<'Tab'> {
    return this._hierarchyGenerator;
  }

  // TODO: Implement renderSummary
  // renderSummary(props: PropsFromGenericComponent<'Tab'>): JSX.Element | null {
  //   return <SummaryTabComponent {...props} />;
  // }

  renderSummaryBoilerplate(): boolean {
    return false;
  }
}

function TabComponent({ node }: PropsFromGenericComponent<'Tab'>) {
  return (
    <Tabs.Content value={node.item.id}>
      {node.item.childComponents.map((n) => (
        <GenericComponent
          key={n.item.id}
          node={n}
        />
      ))}
    </Tabs.Content>
  );
}
