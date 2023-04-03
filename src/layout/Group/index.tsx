import React from 'react';

import { GroupRenderer } from 'src/layout/Group/GroupRenderer';
import { processNonRepeating, processRepeating } from 'src/layout/Group/hierarchy';
import { SummaryGroupComponent } from 'src/layout/Group/SummaryGroupComponent';
import { ContainerComponent } from 'src/layout/LayoutComponent';
import type { PropsFromGenericComponent } from 'src/layout';
import type { SummaryRendererProps } from 'src/layout/LayoutComponent';
import type { HierarchyContext, ProcessorResult, UnprocessedItem } from 'src/utils/layout/HierarchyGenerator';

export class Group extends ContainerComponent<'Group'> {
  directRender(): boolean {
    return true;
  }

  render(props: PropsFromGenericComponent<'Group'>): JSX.Element | null {
    return <GroupRenderer {...props} />;
  }

  renderSummary({
    onChangeClick,
    changeText,
    summaryNode,
    targetNode,
    overrides,
  }: SummaryRendererProps<'Group'>): JSX.Element | null {
    return (
      <SummaryGroupComponent
        onChangeClick={onChangeClick}
        changeText={changeText}
        summaryNode={summaryNode}
        targetNode={targetNode}
        overrides={overrides}
      />
    );
  }

  renderSummaryBoilerplate(): boolean {
    return false;
  }

  useDisplayData(): string {
    return '';
  }

  hierarchyStage1(item: UnprocessedItem<'Group'>): string[] {
    const claimed: string[] = [];
    for (const id of item.children) {
      const [, childId] = item.edit?.multiPage ? id.split(':', 2) : [undefined, id];
      claimed.push(childId);
    }
    return claimed;
  }

  hierarchyStage2(ctx: HierarchyContext): ProcessorResult<'Group'> {
    const item = ctx.generator.prototype(ctx.id) as UnprocessedItem<'Group'>;
    const isRepeating = item.maxCount && item.maxCount >= 1;
    if (isRepeating) {
      return processRepeating(ctx);
    }
    return processNonRepeating(ctx);
  }
}
