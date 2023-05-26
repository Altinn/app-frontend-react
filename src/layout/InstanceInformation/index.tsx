import React from 'react';

import { InstanceInformationComponent } from 'src/layout/InstanceInformation/InstanceInformationComponent';
import { PresentationComponent } from 'src/layout/LayoutComponent';
import type { ExprResolved } from 'src/features/expressions/types';
import type { PropsFromGenericComponent } from 'src/layout';
import type { ILayoutCompInstanceInformation } from 'src/layout/InstanceInformation/types';

export class InstanceInformation extends PresentationComponent<'InstanceInformation'> {
  render(props: PropsFromGenericComponent<'InstanceInformation'>): JSX.Element | null {
    return <InstanceInformationComponent {...props} />;
  }

  canRenderInTable(): boolean {
    return false;
  }
}

export const Config = {
  def: new InstanceInformation(),
  types: {
    layout: {} as unknown as ILayoutCompInstanceInformation,
    node: {} as unknown as ExprResolved<ILayoutCompInstanceInformation>,
  },
};
