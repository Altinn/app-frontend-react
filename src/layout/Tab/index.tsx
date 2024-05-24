import React, { forwardRef } from 'react';

import { Heading, Tabs } from '@digdir/designsystemet-react';

import type { PropsFromGenericComponent } from '..';

import { useLanguage } from 'src/features/language/useLanguage';
import { GenericComponent } from 'src/layout/GenericComponent';
import { TabDef } from 'src/layout/Tab/config.def.generated';
import { TabHierarchyGenerator } from 'src/layout/Tab/hierarchy';
import type { SummaryRendererProps } from 'src/layout/LayoutComponent';
import type { ComponentHierarchyGenerator } from 'src/utils/layout/HierarchyGenerator';
import type { LayoutNode } from 'src/utils/layout/LayoutNode';

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

  renderSummary(props: SummaryRendererProps<'Tab'>): JSX.Element | null {
    return <SummaryTabComponent {...props} />;
  }

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

type SummaryTabComponentProps = {
  targetNode: LayoutNode<'Tab'>;
};

export function SummaryTabComponent({ targetNode }: SummaryTabComponentProps) {
  const { langAsString } = useLanguage();

  const title = langAsString(targetNode.item.textResourceBindings?.['title']);

  return (
    <div>
      <div>
        <Heading>{title}</Heading>
      </div>
      <div>
        {targetNode.item.childComponents.map((n) => (
          // TODO: Add support for summary components like SummaryGroupComponent
          <GenericComponent
            key={n.item.id}
            node={n}
          />
        ))}
      </div>
    </div>
  );
}
