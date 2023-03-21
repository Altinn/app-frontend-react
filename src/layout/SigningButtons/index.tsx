import React from 'react';

import { ActionComponent } from 'src/layout/LayoutComponent';
import { SigningButtonsComponent } from 'src/layout/SigningButtons/SigningButtonsComponent';
import type { PropsFromGenericComponent } from 'src/layout';

export class SigningButtons extends ActionComponent<'SigningButtons'> {
  render(props: PropsFromGenericComponent<'SigningButtons'>): JSX.Element | null {
    return <SigningButtonsComponent {...props} />;
  }

  renderWithLabel(): boolean {
    return false;
  }
}
