import React from 'react';

import { GroupRenderer } from 'src/layout/Group/GroupRenderer';
import { GroupHierarchyGenerator } from 'src/layout/Group/hierarchy';
import { SummaryGroupComponent } from 'src/layout/Group/SummaryGroupComponent';
import { ContainerComponent } from 'src/layout/LayoutComponent';
import type { PropsFromGenericComponent } from 'src/layout';
import type { SummaryRendererProps } from 'src/layout/LayoutComponent';
import type { ComponentHierarchyGenerator } from 'src/utils/layout/HierarchyGenerator';

export class Group extends ContainerComponent<'Group'> {
  private _hierarchyGenerator = new GroupHierarchyGenerator();

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

  hierarchyGenerator(): ComponentHierarchyGenerator<'Group'> {
    return this._hierarchyGenerator;
  }

  canRenderInTable(): boolean {
    return false;
  }
}
