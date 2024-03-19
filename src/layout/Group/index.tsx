import React, { forwardRef } from 'react';
import type { JSX } from 'react';

import { GenericComponent } from 'src/layout/GenericComponent';
import { GroupDef } from 'src/layout/Group/config.def.generated';
import { GroupComponent } from 'src/layout/Group/GroupComponent';
import { SummaryGroupComponent } from 'src/layout/Group/SummaryGroupComponent';
import { DefaultNodeGenerator } from 'src/utils/layout/DefaultNodeGenerator';
import type { LayoutValidationCtx } from 'src/features/devtools/layoutValidation/types';
import type { PropsFromGenericComponent } from 'src/layout';
import type {
  ChildClaimerProps,
  ExprResolver,
  NodeGeneratorProps,
  SummaryRendererProps,
} from 'src/layout/LayoutComponent';

export class Group extends GroupDef {
  directRender(): boolean {
    return true;
  }

  render = forwardRef<HTMLElement, PropsFromGenericComponent<'Group'>>(
    function LayoutComponentGroupRender(props, _): JSX.Element | null {
      return (
        <GroupComponent
          groupNode={props.node}
          renderLayoutNode={(n) => (
            <GenericComponent
              key={n.getId()}
              node={n}
            />
          )}
        />
      );
    },
  );

  claimChildren({ item, claimChild }: ChildClaimerProps<'Group'>): void {
    for (const id of item.children) {
      claimChild(id);
    }
  }

  renderNodeGenerator(props: NodeGeneratorProps<'Group'>): JSX.Element | null {
    // TODO: Implement custom node generator
    return <DefaultNodeGenerator {...props} />;
  }

  evalExpressions({ item, evalTrb, evalCommon }: ExprResolver<'Group'>) {
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

  getDisplayData(): string {
    return '';
  }

  isDataModelBindingsRequired(): boolean {
    return false;
  }

  validateDataModelBindings(ctx: LayoutValidationCtx<'Group'>): string[] {
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
