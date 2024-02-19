import React, { forwardRef } from 'react';

import { ActionButtonComponent } from 'src/layout/ActionButton/ActionButtonComponent';
import { ActionButtonDef } from 'src/layout/ActionButton/config.def.generated';
import type { PropsFromGenericComponent } from 'src/layout';

export class ActionButton extends ActionButtonDef {
  // eslint-disable-next-line react/display-name
  render = forwardRef<HTMLElement, PropsFromGenericComponent<'ActionButton'>>((props, _): JSX.Element | null => (
    <ActionButtonComponent {...props} />
  ));
}
