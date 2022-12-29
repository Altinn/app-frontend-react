import React from 'react';

import { LayoutComponent } from 'src/layout/LayoutComponent';
import { LikertComponent } from 'src/layout/Likert/LikertComponent';
import { LayoutStyle } from 'src/types';
import type { PropsFromGenericComponent } from 'src/layout';

export class Likert extends LayoutComponent<'Likert'> {
  public render(props: PropsFromGenericComponent<'Likert'>): JSX.Element | null {
    return <LikertComponent {...props} />;
  }

  public directRender(props: PropsFromGenericComponent<'Likert'>): boolean {
    return props.layout === LayoutStyle.Table;
  }
}
