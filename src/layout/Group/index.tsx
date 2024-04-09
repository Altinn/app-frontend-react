import React, { forwardRef } from 'react';
import type { JSX } from 'react';

import { GenericComponent } from 'src/layout/GenericComponent';
import { GroupDef } from 'src/layout/Group/config.def.generated';
import { GroupComponent } from 'src/layout/Group/GroupComponent';
import { SummaryGroupComponent } from 'src/layout/Group/SummaryGroupComponent';
import type { PropsFromGenericComponent } from 'src/layout';
import type { ChildClaimerProps, SummaryRendererProps } from 'src/layout/LayoutComponent';

export class Group extends GroupDef {
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
}
