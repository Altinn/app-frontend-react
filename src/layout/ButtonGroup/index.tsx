import React, { forwardRef } from 'react';
import type { JSX } from 'react';

import type { PropsFromGenericComponent } from '..';

import { ButtonGroupComponent } from 'src/layout/ButtonGroup/ButtonGroupComponent';
import { ButtonGroupDef } from 'src/layout/ButtonGroup/config.def.generated';
import { DefaultNodeGenerator } from 'src/utils/layout/DefaultNodeGenerator';
import { NodeChildren } from 'src/utils/layout/NodesGenerator';
import type { DisplayData } from 'src/features/displayData';
import type { ChildClaimerProps, NodeGeneratorProps } from 'src/layout/LayoutComponent';
import type { LayoutNode } from 'src/utils/layout/LayoutNode';

export class ButtonGroup extends ButtonGroupDef implements DisplayData<'ButtonGroup'> {
  render = forwardRef<HTMLElement, PropsFromGenericComponent<'ButtonGroup'>>(
    function LayoutComponentButtonGroupRender(props, _): JSX.Element | null {
      return <ButtonGroupComponent {...props} />;
    },
  );

  claimChildren({ claimChild, getProto, item }: ChildClaimerProps<'ButtonGroup'>): void {
    for (const childId of item.children) {
      if (!childId) {
        continue;
      }
      const proto = getProto(childId);
      if (!proto) {
        continue;
      }
      if (!proto.def.canRenderInButtonGroup()) {
        window.logWarn(
          `ButtonGroup component included a component '${childId}', which ` +
            `is a '${proto.type}' and cannot be rendered in a ButtonGroup.`,
        );
        continue;
      }
      claimChild(childId);
    }
  }

  renderNodeGenerator(props: NodeGeneratorProps<'ButtonGroup'>): React.JSX.Element | null {
    return (
      <DefaultNodeGenerator {...props}>
        <NodeChildren childIds={props.childIds} />
      </DefaultNodeGenerator>
    );
  }

  shouldRenderInAutomaticPDF() {
    return false;
  }

  getDisplayData(_node: LayoutNode<'ButtonGroup'>): string {
    return '';
  }

  renderSummary(): JSX.Element | null {
    return null;
  }

  validateDataModelBindings(): string[] {
    return [];
  }
}
