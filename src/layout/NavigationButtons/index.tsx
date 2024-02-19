import React, { forwardRef } from 'react';

import { NavigationButtonsDef } from 'src/layout/NavigationButtons/config.def.generated';
import { NavigationButtonsComponent } from 'src/layout/NavigationButtons/NavigationButtonsComponent';
import type { PropsFromGenericComponent } from 'src/layout';

export class NavigationButtons extends NavigationButtonsDef {
  // eslint-disable-next-line react/display-name
  render = forwardRef<HTMLElement, PropsFromGenericComponent<'NavigationButtons'>>((props, _): JSX.Element | null => (
    <NavigationButtonsComponent {...props} />
  ));
}
