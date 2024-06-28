import React, { forwardRef } from 'react';
import type { JSX } from 'react';

import { GenericComponent } from 'src/layout/GenericComponent';
import { GroupDef } from 'src/layout/Group/config.def.generated';
import { GroupComponent } from 'src/layout/Group/GroupComponent';
import { GroupSummary } from 'src/layout/Group/GroupSummary';
import { SummaryGroupComponent } from 'src/layout/Group/SummaryGroupComponent';
import type { PropsFromGenericComponent } from 'src/layout';
import type { SummaryRendererProps } from 'src/layout/LayoutComponent';
import type { GroupSummaryOverrideProps } from 'src/layout/Summary2/config.generated';
import type { LayoutNode } from 'src/utils/layout/LayoutNode';

export class Group extends GroupDef {
  render = forwardRef<HTMLElement, PropsFromGenericComponent<'Group'>>(
    function LayoutComponentGroupRender(props, _): JSX.Element | null {
      return (
        <GroupComponent
          groupNode={props.node}
          renderLayoutNode={(node) => (
            <GenericComponent
              key={node.id}
              node={node}
            />
          )}
        />
      );
    },
  );

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

  renderSummary2(componentNode: LayoutNode<'Group'>, summaryOverrides?: GroupSummaryOverrideProps): JSX.Element | null {
    return (
      <GroupSummary
        componentNode={componentNode}
        summaryOverrides={summaryOverrides}
      />
    );
  }

  renderSummaryBoilerplate(): boolean {
    return false;
  }
}
