import React from 'react';

import { SummaryBoilerplate } from 'src/components/summary/SummaryBoilerplate';
import { SummaryGroupComponent } from 'src/components/summary/SummaryGroupComponent';
import { FormComponent } from 'src/layout/LayoutComponent';
import type { ComponentExceptGroupAndSummary } from 'src/layout/layout';
import type { LayoutNode } from 'src/utils/layout/hierarchy';
import type { LayoutNodeFromType } from 'src/utils/layout/hierarchy.types';

export interface ISummaryComponentSwitch {
  change: {
    onChangeClick: () => void;
    changeText: string | null;
  };
  summaryNode: LayoutNodeFromType<'Summary'>;
  targetNode: LayoutNode;
  label?: JSX.Element | JSX.Element[] | null | undefined;
}

export function SummaryComponentSwitch({ change, summaryNode, targetNode, label }: ISummaryComponentSwitch) {
  if (targetNode.item.type === 'Group') {
    const correctNode = targetNode as LayoutNodeFromType<'Group'>;
    return (
      <SummaryGroupComponent
        {...change}
        summaryNode={summaryNode}
        targetNode={correctNode}
      />
    );
  }

  const component = targetNode.getComponent();
  if (component instanceof FormComponent) {
    const RenderSummary = component.renderSummary.bind(component);
    return (
      <>
        <SummaryBoilerplate
          {...change}
          label={label}
          summaryNode={summaryNode}
          targetNode={targetNode}
        />
        <RenderSummary
          summaryNode={summaryNode}
          targetNode={targetNode as LayoutNodeFromType<ComponentExceptGroupAndSummary>}
        />
      </>
    );
  }

  // PRIORITY: Figure out what to do here? Render GenericComponent?
  throw new Error('TODO: Implement');
}
