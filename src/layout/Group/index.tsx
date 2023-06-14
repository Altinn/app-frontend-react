import React from 'react';

import { implementsNodeValidation } from 'src/layout';
import { GroupRenderer } from 'src/layout/Group/GroupRenderer';
import { GroupHierarchyGenerator } from 'src/layout/Group/hierarchy';
import { SummaryGroupComponent } from 'src/layout/Group/SummaryGroupComponent';
import { ContainerComponent } from 'src/layout/LayoutComponent';
import type { GroupValidation, PropsFromGenericComponent } from 'src/layout';
import type { HGroups, ILayoutGroup } from 'src/layout/Group/types';
import type { SummaryRendererProps } from 'src/layout/LayoutComponent';
import type { LayoutNodeFromType } from 'src/utils/layout/hierarchy.types';
import type { ComponentHierarchyGenerator } from 'src/utils/layout/HierarchyGenerator';
import type { LayoutNode } from 'src/utils/layout/LayoutNode';
import type { IValidationOutput } from 'src/utils/validation/types';

export class Group extends ContainerComponent<'Group'> implements GroupValidation {
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

  runGroupValidations(node: LayoutNodeFromType<'Group'>, onlyInRowIndex?: number): IValidationOutput[] {
    const validations: IValidationOutput[] = [];
    for (const child of node.flat(false, onlyInRowIndex)) {
      if (implementsNodeValidation(child.def)) {
        validations.push(child.def.runValidations(child as any));
      }
    }
    return validations;
  }
}

export const Config = {
  def: new Group(),
};

export type TypeConfig = {
  layout: ILayoutGroup;
  nodeItem: HGroups;
  nodeObj: LayoutNode;
};
