import React, { forwardRef } from 'react';

import { PanelDef } from 'src/layout/Panel/config.def.generated';
import { PanelComponent } from 'src/layout/Panel/PanelComponent';
import type { PropsFromGenericComponent } from 'src/layout';

export class Panel extends PanelDef {
  // eslint-disable-next-line react/display-name
  render = forwardRef<HTMLElement, PropsFromGenericComponent<'Panel'>>((props, _): JSX.Element | null => (
    <PanelComponent {...props} />
  ));
}
