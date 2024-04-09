import React, { forwardRef } from 'react';
import type { JSX } from 'react';

import type { PropsFromGenericComponent } from '..';

import { ButtonGroupComponent } from 'src/layout/ButtonGroup/ButtonGroupComponent';
import { ButtonGroupDef } from 'src/layout/ButtonGroup/config.def.generated';
import { DefaultNodeGenerator } from 'src/utils/layout/DefaultNodeGenerator';
import { NodeChildren } from 'src/utils/layout/NodesGenerator';
import type { DisplayData } from 'src/features/displayData';
import type { NodeGeneratorProps } from 'src/layout/LayoutComponent';

export class ButtonGroup extends ButtonGroupDef implements DisplayData<'ButtonGroup'> {
  render = forwardRef<HTMLElement, PropsFromGenericComponent<'ButtonGroup'>>(
    function LayoutComponentButtonGroupRender(props, _): JSX.Element | null {
      return <ButtonGroupComponent {...props} />;
    },
  );

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

  renderSummary(): JSX.Element | null {
    return null;
  }
}
