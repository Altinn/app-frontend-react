import React, { forwardRef } from 'react';
import type { JSX } from 'react';

import { getLayoutComponentObject } from '..';
import type { PropsFromGenericComponent, ValidateComponent } from '..';

import { FrontendValidationSource, ValidationMask } from 'src/features/validation';
import { RepeatingGroupDef } from 'src/layout/RepeatingGroup/config.def.generated';
import { GroupHierarchyGenerator } from 'src/layout/RepeatingGroup/hierarchy';
import { RepeatingGroupContainer } from 'src/layout/RepeatingGroup/RepeatingGroupContainer';
import { RepeatingGroupProvider } from 'src/layout/RepeatingGroup/RepeatingGroupContext';
import { RepeatingGroupsFocusProvider } from 'src/layout/RepeatingGroup/RepeatingGroupFocusContext';
import { SummaryRepeatingGroup } from 'src/layout/RepeatingGroup/Summary/SummaryRepeatingGroup';
import type { LayoutValidationCtx } from 'src/features/devtools/layoutValidation/types';
import type { ComponentValidation } from 'src/features/validation';
import type { CompInternal } from 'src/layout/layout';
import type { ChildClaimerProps, ExprResolver, SummaryRendererProps } from 'src/layout/LayoutComponent';
import type { CompRepeatingGroupInternal } from 'src/layout/RepeatingGroup/config.generated';
import type { ComponentHierarchyGenerator } from 'src/utils/layout/HierarchyGenerator';
import type { LayoutNode } from 'src/utils/layout/LayoutNode';

export class RepeatingGroup extends RepeatingGroupDef implements ValidateComponent<'RepeatingGroup'> {
  private _hierarchyGenerator = new GroupHierarchyGenerator();

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

  evalExpressions({ item, evalTrb, evalCommon }: ExprResolver<'RepeatingGroup'>): CompInternal<'RepeatingGroup'> {
    return {
      ...item,
      ...evalCommon(item),
      ...evalTrb(item),
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

  hierarchyGenerator(): ComponentHierarchyGenerator<'RepeatingGroup'> {
    return this._hierarchyGenerator;
  }

  runComponentValidation(node: LayoutNode<'RepeatingGroup'>, item: CompRepeatingGroupInternal): ComponentValidation[] {
    if (!item.dataModelBindings) {
      return [];
    }

    const validations: ComponentValidation[] = [];
    // check if minCount is less than visible rows
    const repeatingGroupMinCount = item.minCount || 0;
    const repeatingGroupVisibleRows = item.rows.filter((row) => row && !row.groupExpressions?.hiddenRow).length;

    // Validate minCount
    if (repeatingGroupVisibleRows < repeatingGroupMinCount) {
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
