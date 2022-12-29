import React from 'react';

import { LayoutComponent } from 'src/layout/LayoutComponent';
import { RadioButtonContainerComponent } from 'src/layout/RadioButtons/RadioButtonsContainerComponent';
import type { PropsFromGenericComponent } from 'src/layout';

export class RadioButtons extends LayoutComponent<'RadioButtons'> {
  public render(props: PropsFromGenericComponent<'RadioButtons'>): JSX.Element | null {
    return <RadioButtonContainerComponent {...props} />;
  }
}
