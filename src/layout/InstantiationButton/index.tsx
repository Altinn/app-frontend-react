import React, { forwardRef } from 'react';

import { InstantiationButtonDef } from 'src/layout/InstantiationButton/config.def.generated';
import { InstantiationButtonComponent } from 'src/layout/InstantiationButton/InstantiationButtonComponent';
import type { PropsFromGenericComponent } from 'src/layout';

export class InstantiationButton extends InstantiationButtonDef {
  // eslint-disable-next-line react/display-name
  render = forwardRef<HTMLElement, PropsFromGenericComponent<'InstantiationButton'>>((props, _): JSX.Element | null => (
    <InstantiationButtonComponent {...props} />
  ));
}
