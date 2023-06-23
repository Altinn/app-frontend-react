import React from 'react';

import { staticUseLanguageFromState } from 'src/hooks/useLanguage';
import { implementsNodeValidation } from 'src/layout';
import { GroupRenderer } from 'src/layout/Group/GroupRenderer';
import { GroupHierarchyGenerator } from 'src/layout/Group/hierarchy';
import { SummaryGroupComponent } from 'src/layout/Group/SummaryGroupComponent';
import { ContainerComponent } from 'src/layout/LayoutComponent';
import {
  buildValidationObject,
  createComponentValidationResult,
  createLayoutValidationResult,
  emptyValidation,
  getSchemaValidationErrors,
} from 'src/utils/validation/validationHelpers';
import type { GroupValidation, NodeValidation, PropsFromGenericComponent } from 'src/layout';
import type { HGroups, ILayoutGroup } from 'src/layout/Group/types';
import type { SummaryRendererProps } from 'src/layout/LayoutComponent';
import type { IComponentValidationResult, ILayoutValidationResult, IRuntimeState } from 'src/types';
import type { LayoutNodeFromType } from 'src/utils/layout/hierarchy.types';
import type { ComponentHierarchyGenerator } from 'src/utils/layout/HierarchyGenerator';
import type { LayoutNode } from 'src/utils/layout/LayoutNode';
import type { IValidationObject } from 'src/utils/validation/types';

export class Group extends ContainerComponent<'Group'> implements GroupValidation, NodeValidation {
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

  runEmptyFieldValidation(_node: LayoutNodeFromType<'Group'>): IValidationObject[] {
    return [];
  }

  runSchemaValidation(_node: LayoutNodeFromType<'Group'>): IValidationObject[] {
    return [];
  }

  runComponentValidation(node: LayoutNodeFromType<'Group'>): IValidationObject[] {
    if (!node.isRepGroup() || node.isHidden() || node.item.renderAsSummary) {
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

  runValidations(node: LayoutNodeFromType<'Group'>): IValidationObject[] {
    const nodeValidationObjects = this.runComponentValidation(node);
    return nodeValidationObjects.length ? nodeValidationObjects : [emptyValidation(node)];
  }

  validateComponent(node: LayoutNodeFromType<'Group'>): IComponentValidationResult {
    const validationObjects = this.runValidations(node);
    return createComponentValidationResult(validationObjects);
  }

  runGroupValidations(node: LayoutNodeFromType<'Group'>, onlyInRowIndex?: number): IValidationObject[] {
    const visibleChildren = node
      .flat(true, onlyInRowIndex)
      .filter((node) => !node.isHidden() && !node.item.renderAsSummary);

    const schemaErrors = getSchemaValidationErrors();

    const validations: IValidationObject[] = [];
    for (const child of visibleChildren) {
      if (implementsNodeValidation(child.def)) {
        const emptyFieldValidation = child.def.runEmptyFieldValidation(child as any);
        const componentValidation = child.def.runComponentValidation(child as any);
        const nodeValidations = [...emptyFieldValidation, ...componentValidation];

        for (const error of schemaErrors) {
          if (node.item.dataModelBindings) {
            const bindings = Object.entries(node.item.dataModelBindings);
            for (const [bindingKey, bindingField] of bindings) {
              if (bindingField === error.bindingField) {
                nodeValidations.push(
                  buildValidationObject(node, 'errors', error.message, bindingKey, error.invalidDataType),
                );
              }
            }
          }
        }

        if (nodeValidations.length) {
          validations.push(...nodeValidations);
        } else {
          validations.push(emptyValidation(child));
        }
      }
    }

    return validations;
  }

  validateGroup(node: LayoutNodeFromType<'Group'>, onlyInRowIndex?: number): ILayoutValidationResult {
    const validations = this.runGroupValidations(node, onlyInRowIndex);
    return createLayoutValidationResult(validations);
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
