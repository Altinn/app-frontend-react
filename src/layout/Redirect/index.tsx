import React from 'react';

import type { PropsFromGenericComponent } from '..';

import { ActionComponent } from 'src/layout/LayoutComponent';
import { RedirectComponent } from 'src/layout/Redirect/RedirectComponent';

export class Redirect extends ActionComponent<'Redirect'> {
  render(props: PropsFromGenericComponent<'Redirect'>): JSX.Element | null {
    return <RedirectComponent {...props} />;
  }

  canRenderInButtonGroup(): boolean {
    return true;
  }

  renderWithLabel(): boolean {
    return false;
  }
}
