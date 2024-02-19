import React, { forwardRef } from 'react';

import { ButtonComponent } from 'src/layout/Button/ButtonComponent';
import { ButtonDef } from 'src/layout/Button/config.def.generated';
import type { PropsFromGenericComponent } from 'src/layout';

export class Button extends ButtonDef {
  // eslint-disable-next-line react/display-name
  render = forwardRef<HTMLElement, PropsFromGenericComponent<'Button'>>((props, _): JSX.Element | null => (
    <ButtonComponent {...props} />
  ));
}
