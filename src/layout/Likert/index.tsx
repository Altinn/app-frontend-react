import React from 'react';

import { FormComponent } from 'src/layout/LayoutComponent';
import { LikertComponent } from 'src/layout/Likert/LikertComponent';
import { LayoutStyle } from 'src/types';
import type { PropsFromGenericComponent } from 'src/layout';

export class Likert extends FormComponent<'Likert'> {
  render(props: PropsFromGenericComponent<'Likert'>): JSX.Element | null {
    return <LikertComponent {...props} />;
  }

  directRender(props: PropsFromGenericComponent<'Likert'>): boolean {
    return props.layout === LayoutStyle.Table;
  }

  renderWithLabel(): boolean {
    return false;
  }
}
