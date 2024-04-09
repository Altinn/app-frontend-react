import React, { forwardRef } from 'react';
import type { JSX } from 'react';

import type { PropsFromGenericComponent } from '..';

import { ButtonGroupComponent } from 'src/layout/ButtonGroup/ButtonGroupComponent';
import { ButtonGroupDef } from 'src/layout/ButtonGroup/config.def.generated';
import type { DisplayData } from 'src/features/displayData';

export class ButtonGroup extends ButtonGroupDef implements DisplayData<'ButtonGroup'> {
  render = forwardRef<HTMLElement, PropsFromGenericComponent<'ButtonGroup'>>(
    function LayoutComponentButtonGroupRender(props, _): JSX.Element | null {
      return <ButtonGroupComponent {...props} />;
    },
  );

  shouldRenderInAutomaticPDF() {
    return false;
  }

  renderSummary(): JSX.Element | null {
    return null;
  }
}
