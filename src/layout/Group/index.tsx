import React from 'react';

import { staticUseLanguageFromState } from 'src/hooks/useLanguage';
import { GroupRenderer } from 'src/layout/Group/GroupRenderer';
import { GroupHierarchyGenerator } from 'src/layout/Group/hierarchy';
import { SummaryGroupComponent } from 'src/layout/Group/SummaryGroupComponent';
import { ContainerComponent } from 'src/layout/LayoutComponent';
import { buildValidationObject, runValidationOnNodes } from 'src/utils/validation/validationHelpers';
import type { IFormData } from 'src/features/formData';
import type { ComponentValidation, GroupValidation, PropsFromGenericComponent } from 'src/layout';
import type { HGroups, ILayoutGroup } from 'src/layout/Group/types';
import type { SummaryRendererProps } from 'src/layout/LayoutComponent';
import type { IRuntimeState } from 'src/types';
import type { LayoutNodeFromType } from 'src/utils/layout/hierarchy.types';
import type { ComponentHierarchyGenerator } from 'src/utils/layout/HierarchyGenerator';
import type { LayoutNode } from 'src/utils/layout/LayoutNode';
import type { IValidationObject } from 'src/utils/validation/types';

export class Group extends ContainerComponent<'Group'> implements GroupValidation, ComponentValidation {
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

  runComponentValidation(node: LayoutNodeFromType<'Group'>, _overrideFormData?: IFormData): IValidationObject[] {
    if (!node.isRepGroup()) {
      return [];
    }

    const state: IRuntimeState = window.reduxStore.getState();

    const { langAsString } = staticUseLanguageFromState(state);
    const validationObjects: IValidationObject[] = [];
    // check if minCount is less than visible rows
    const repeatingGroupComponent = node.item;
    const repeatingGroupMinCount = repeatingGroupComponent.minCount || 0;
    const repeatingGroupVisibleRows = repeatingGroupComponent.rows.filter(
      (row) => row && !row.groupExpressions?.hiddenRow,
    ).length;

    const repeatingGroupMinCountValid = repeatingGroupMinCount <= repeatingGroupVisibleRows;

    // if not valid, return appropriate error message
    if (!repeatingGroupMinCountValid) {
      const errorMessage = langAsString('validation_errors.minItems', [repeatingGroupMinCount]);

      validationObjects.push(buildValidationObject(node, 'errors', errorMessage, 'group'));
    }

    return validationObjects;
  }

  runGroupValidations(node: LayoutNodeFromType<'Group'>, onlyInRowIndex?: number): IValidationObject[] {
    return runValidationOnNodes(node.flat(true, onlyInRowIndex));
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
