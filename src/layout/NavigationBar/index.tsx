import React, { forwardRef } from 'react';

import { NavigationBarDef } from 'src/layout/NavigationBar/config.def.generated';
import { NavigationBarComponent } from 'src/layout/NavigationBar/NavigationBarComponent';
import type { PropsFromGenericComponent } from 'src/layout';

export class NavigationBar extends NavigationBarDef {
  // eslint-disable-next-line react/display-name
  render = forwardRef<HTMLElement, PropsFromGenericComponent<'NavigationBar'>>((props, _): JSX.Element | null => (
    <NavigationBarComponent {...props} />
  ));
}
