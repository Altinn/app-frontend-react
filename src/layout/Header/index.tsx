import React, { forwardRef } from 'react';

import { HeaderDef } from 'src/layout/Header/config.def.generated';
import { HeaderComponent } from 'src/layout/Header/HeaderComponent';
import type { PropsFromGenericComponent } from 'src/layout';

export class Header extends HeaderDef {
  // eslint-disable-next-line react/display-name
  render = forwardRef<HTMLElement, PropsFromGenericComponent<'Header'>>((props, _): JSX.Element | null => (
    <HeaderComponent {...props} />
  ));
}
