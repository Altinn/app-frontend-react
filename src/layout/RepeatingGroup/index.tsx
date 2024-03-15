import React, { forwardRef } from 'react';
import type { JSX } from 'react';

import { getLayoutComponentObject } from '..';
import type { PropsFromGenericComponent, ValidateComponent, ValidationFilter, ValidationFilterFunction } from '..';

import { FrontendValidationSource, ValidationMask } from 'src/features/validation';
import { RepeatingGroupDef } from 'src/layout/RepeatingGroup/config.def.generated';
import { RepeatingGroupContainer } from 'src/layout/RepeatingGroup/RepeatingGroupContainer';
import { RepeatingGroupProvider } from 'src/layout/RepeatingGroup/RepeatingGroupContext';
import { RepeatingGroupsFocusProvider } from 'src/layout/RepeatingGroup/RepeatingGroupFocusContext';
import { SummaryRepeatingGroup } from 'src/layout/RepeatingGroup/Summary/SummaryRepeatingGroup';
import type { LayoutValidationCtx } from 'src/features/devtools/layoutValidation/types';
import type { BaseValidation, ComponentValidation } from 'src/features/validation';
import type { CompInternal } from 'src/layout/layout';
import type { ChildClaimerProps, ExprResolver, SummaryRendererProps } from 'src/layout/LayoutComponent';
import type { CompRepeatingGroupInternal } from 'src/layout/RepeatingGroup/config.generated';
import type { LayoutNode } from 'src/utils/layout/LayoutNode';

export class RepeatingGroup extends RepeatingGroupDef implements ValidateComponent, ValidationFilter {
  directRender(): boolean {
    return true;
  }

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

  evalExpressions({
    item,
    evalTrb,
    evalCommon,
    evalExpr,
  }: ExprResolver<'RepeatingGroup'>): CompInternal<'RepeatingGroup'> {
    return {
      ...item,
      ...evalCommon(item),
      ...evalTrb(item), // TODO: Resolve per row
      hiddenRow: evalExpr<boolean | undefined>(item.hiddenRow, false), // TODO: Resolve per row
      edit: item.edit
        ? {
            ...item.edit,
            addButton: evalExpr<boolean | undefined>(item.edit.addButton, true),
            saveButton: evalExpr<boolean | undefined>(item.edit.saveButton, true), // TODO: Resolve per row
            deleteButton: evalExpr<boolean | undefined>(item.edit.deleteButton, true), // TODO: Resolve per row
            editButton: evalExpr<boolean | undefined>(item.edit.editButton, true), // TODO: Resolve per row
            alertOnDelete: evalExpr<boolean | undefined>(item.edit.alertOnDelete, false), // TODO: Resolve per row
            saveAndNextButton: evalExpr<boolean | undefined>(item.edit.saveAndNextButton, false), // TODO: Resolve per row
          }
        : undefined,
    };
  }

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

  runComponentValidation(node: LayoutNode<'RepeatingGroup'>, item: CompRepeatingGroupInternal): ComponentValidation[] {
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
