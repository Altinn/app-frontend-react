import React, { forwardRef } from 'react';
import type { JSX } from 'react';

import { getLayoutComponentObject } from '..';
import type {
  NodeRef,
  PropsFromGenericComponent,
  ValidateComponent,
  ValidationFilter,
  ValidationFilterFunction,
} from '..';

import { ALTINN_ROW_ID } from 'src/features/formData/types';
import { FrontendValidationSource, ValidationMask } from 'src/features/validation';
import { RepeatingGroupDef } from 'src/layout/RepeatingGroup/config.def.generated';
import { RepeatingGroupContainer } from 'src/layout/RepeatingGroup/RepeatingGroupContainer';
import { RepeatingGroupProvider } from 'src/layout/RepeatingGroup/RepeatingGroupContext';
import { RepeatingGroupsFocusProvider } from 'src/layout/RepeatingGroup/RepeatingGroupFocusContext';
import { SummaryRepeatingGroup } from 'src/layout/RepeatingGroup/Summary/SummaryRepeatingGroup';
import type { LayoutValidationCtx } from 'src/features/devtools/layoutValidation/types';
import type { BaseValidation, ComponentValidation } from 'src/features/validation';
import type { GridRowsInternal } from 'src/layout/Grid/types';
import type { CompInternal, CompTypes } from 'src/layout/layout';
import type { ChildClaimerProps, ExprResolver, SummaryRendererProps } from 'src/layout/LayoutComponent';
import type { RepGroupInternal, RepGroupRows } from 'src/layout/RepeatingGroup/types';
import type { ChildLookupRestriction } from 'src/utils/layout/HierarchyGenerator';
import type { ItemStore } from 'src/utils/layout/itemState';
import type { LayoutNode } from 'src/utils/layout/LayoutNode';

export class RepeatingGroup extends RepeatingGroupDef implements ValidateComponent<'RepeatingGroup'>, ValidationFilter {
  render = forwardRef<HTMLDivElement, PropsFromGenericComponent<'RepeatingGroup'>>(
    function LayoutComponentRepeatingGroupRender(props, ref): JSX.Element | null {
      return (
        <RepeatingGroupProvider node={props.node}>
          <RepeatingGroupsFocusProvider>
            <RepeatingGroupContainer ref={ref} />
          </RepeatingGroupsFocusProvider>
        </RepeatingGroupProvider>
      );
    },
  );

  claimChildren(props: ChildClaimerProps<'RepeatingGroup'>): void {
    const { claimChild, item } = props;
    for (const id of item.children) {
      const [, childId] = item.edit?.multiPage ? id.split(':', 2) : [undefined, id];
      claimChild(childId);
    }

    for (const rows of [item.rowsBefore, item.rowsAfter]) {
      if (rows) {
        getLayoutComponentObject('Grid').claimChildrenForRows(rows, props);
      }
    }
  }

  evalExpressions(props: ExprResolver<'RepeatingGroup'>): RepGroupInternal {
    const { item, evalBool, formDataSelector } = props;

    // Only fetch the row ID (and by extension the number of rows) so that we only re-evaluate expressions
    // when the number of rows change.
    const formData = item.dataModelBindings?.group
      ? (formDataSelector(item.dataModelBindings.group, (rows) =>
          Array.isArray(rows) ? rows.map((row, index) => ({ [ALTINN_ROW_ID]: row[ALTINN_ROW_ID], index })) : [],
        ) as { altinnRowId: string; index: number }[])
      : undefined;

    const rows: RepGroupRows =
      (formData?.map((row) => ({
        uuid: row[ALTINN_ROW_ID],
        index: row.index,
        groupExpressions: {
          hiddenRow: evalBool(item.hiddenRow, false), // TODO: Implement support for row-eval
          // TODO: Implement the rest
        },
      })) as RepGroupRows) ?? [];

    return {
      ...this.evalDefaultExpressions(props),
      edit: item.edit
        ? {
            ...item.edit,
            addButton: evalBool(item.edit.addButton, true),
          }
        : undefined,
      rows,

      // TODO: Call the code in Grid to evaluate the rowsBefore and rowsAfter
      rowsBefore: item.rowsBefore as GridRowsInternal | undefined,
      rowsAfter: item.rowsAfter as GridRowsInternal | undefined,
    };
  }

  pickDirectChildren(_state: ItemStore<'RepeatingGroup'>, _restriction?: ChildLookupRestriction): NodeRef[] {
    // TODO: Implement
    return [];
  }

  pickChild<C extends CompTypes>(
    _state: ItemStore<'RepeatingGroup'>,
    _childId: string,
    _parentPath: string[],
  ): ItemStore<C> {
    return {} as any;
  }

  addChild(_state: ItemStore<'RepeatingGroup'>, _childNode: LayoutNode, _childStore: ItemStore) {}

  removeChild(_state: ItemStore<'RepeatingGroup'>, _childNode: LayoutNode) {}

  renderSummary({
    onChangeClick,
    changeText,
    summaryNode,
    targetNode,
    overrides,
  }: SummaryRendererProps<'RepeatingGroup'>): JSX.Element | null {
    return (
      <SummaryRepeatingGroup
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

  getDisplayData(): string {
    return '';
  }

  runComponentValidation(
    node: LayoutNode<'RepeatingGroup'>,
    item: CompInternal<'RepeatingGroup'>,
  ): ComponentValidation[] {
    if (!item.dataModelBindings) {
      return [];
    }

    const validations: ComponentValidation[] = [];
    // check if minCount is less than visible rows
    const minCount = item.minCount || 0;
    const visibleRows = item.rows.filter((row) => row && !row.groupExpressions?.hiddenRow).length;

    // Validate minCount
    if (visibleRows < minCount) {
      validations.push({
        message: { key: 'validation_errors.minItems', params: [minCount] },
        severity: 'error',
        componentId: node.getId(),
        source: FrontendValidationSource.Component,
        // Treat visibility of minCount the same as required to prevent showing an error immediately
        category: ValidationMask.Required,
      });
    }

    return validations;
  }

  /**
   * Repeating group has its own minCount property, so if set, we should filter out the minItems validation from schema.
   */
  private schemaMinItemsFilter(validation: BaseValidation): boolean {
    return !(
      validation.source === FrontendValidationSource.Schema && validation.message.key === 'validation_errors.minItems'
    );
  }

  getValidationFilters(_node: LayoutNode<'RepeatingGroup'>): ValidationFilterFunction[] {
    if ((_node.item.minCount ?? 0) > 0) {
      return [this.schemaMinItemsFilter];
    }
    return [];
  }

  isDataModelBindingsRequired(): boolean {
    return true;
  }

  validateDataModelBindings(ctx: LayoutValidationCtx<'RepeatingGroup'>): string[] {
    const [errors, result] = this.validateDataModelBindingsAny(ctx, 'group', ['array']);
    if (errors) {
      return errors;
    }

    if (result) {
      const innerType = Array.isArray(result.items) ? result.items[0] : result.items;
      if (!innerType || typeof innerType !== 'object' || !innerType.type || innerType.type !== 'object') {
        return [`group-datamodellbindingen peker mot en ukjent type i datamodellen`];
      }
    }

    return [];
  }
}
