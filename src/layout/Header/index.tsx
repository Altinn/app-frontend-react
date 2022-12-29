import React from 'react';

import { HeaderComponent } from 'src/layout/Header/HeaderComponent';
import { LayoutComponent } from 'src/layout/LayoutComponent';
import type { PropsFromGenericComponent } from 'src/layout';

export class Header extends LayoutComponent<'Header'> {
  public render(props: PropsFromGenericComponent<'Header'>): JSX.Element | null {
    return <HeaderComponent {...props} />;
  }
}
