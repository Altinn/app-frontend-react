import React from 'react';

import { FormComponent } from 'src/layout/LayoutComponent';
import { RadioButtonContainerComponent } from 'src/layout/RadioButtons/RadioButtonsContainerComponent';
import type { PropsFromGenericComponent } from 'src/layout';

export class RadioButtons extends FormComponent<'RadioButtons'> {
  render(props: PropsFromGenericComponent<'RadioButtons'>): JSX.Element | null {
    return <RadioButtonContainerComponent {...props} />;
  }

  renderWithLabel(): boolean {
    return false;
  }
}
