import React, { forwardRef, type JSX } from 'react';

import type { PropsFromGenericComponent } from '..';

import { EmptyChildrenBoundary } from 'src/layout/Summary2/isEmpty/EmptyChildrenContext';
import { TabsDef } from 'src/layout/Tabs/config.def.generated';
import { Tabs as TabsComponent } from 'src/layout/Tabs/Tabs';
import { TabsSummary } from 'src/layout/Tabs/TabsSummary';
import { TabsSummaryComponent } from 'src/layout/Tabs/TabsSummaryComponent';
import type { ChildClaimerProps, SummaryRendererProps } from 'src/layout/LayoutComponent';
import type { Summary2Props } from 'src/layout/Summary2/SummaryComponent2/types';

export class Tabs extends TabsDef {
  render = forwardRef<HTMLElement, PropsFromGenericComponent<'Tabs'>>(
    function LayoutComponentTabsRender(props, _): JSX.Element | null {
      return <TabsComponent {...props} />;
    },
  );

  renderSummary(props: SummaryRendererProps): JSX.Element | null {
    return <TabsSummaryComponent {...props} />;
  }

  renderSummary2(props: Summary2Props): JSX.Element | null {
    return (
      <EmptyChildrenBoundary>
        <TabsSummary {...props} />
      </EmptyChildrenBoundary>
    );
  }

  renderSummaryBoilerplate(): boolean {
    return false;
  }

  extraNodeGeneratorChildren(): string {
    return `<GenerateNodeChildren claims={props.childClaims} pluginKey='TabsPlugin' />`;
  }

  claimChildren({ item, claimChild, getType, getCapabilities }: ChildClaimerProps<'Tabs'>): void {
    for (const tab of (item.tabs || []).values()) {
      for (const child of tab.children.values()) {
        const type = getType(child);
        if (!type) {
          continue;
        }
        const capabilities = getCapabilities(type);
        if (!capabilities.renderInTabs) {
          window.logWarn(
            `Tabs component included a component '${child}', which ` +
              `is a '${type}' and cannot be rendered as a Tabs child.`,
          );
          continue;
        }
        claimChild('TabsPlugin', child);
      }
    }
  }
}
