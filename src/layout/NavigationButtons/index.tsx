import React from 'react';

import { LayoutComponent } from 'src/layout/LayoutComponent';
import { NavigationButtonsComponent } from 'src/layout/NavigationButtons/NavigationButtonsComponent';
import type { PropsFromGenericComponent } from 'src/layout';

export class NavigationButtons extends LayoutComponent<'NavigationButtons'> {
  public render(props: PropsFromGenericComponent<'NavigationButtons'>): JSX.Element | null {
    return <NavigationButtonsComponent {...props} />;
  }
}
