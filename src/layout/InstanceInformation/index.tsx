import React from 'react';

import { InstanceInformationDef } from 'src/layout/InstanceInformation/config.generated';
import { InstanceInformationComponent } from 'src/layout/InstanceInformation/InstanceInformationComponent';
import type { ExprResolved } from 'src/features/expressions/types';
import type { PropsFromGenericComponent } from 'src/layout';
import type { ILayoutCompInstanceInformation } from 'src/layout/InstanceInformation/types';
import type { LayoutNode } from 'src/utils/layout/LayoutNode';

export class InstanceInformation extends InstanceInformationDef {
  render(props: PropsFromGenericComponent<'InstanceInformation'>): JSX.Element | null {
    return <InstanceInformationComponent {...props} />;
  }
}

export const Config = {
  def: new InstanceInformation(),
  rendersWithLabel: true as const,
};

export type TypeConfig = {
  layout: ILayoutCompInstanceInformation;
  nodeItem: ExprResolved<ILayoutCompInstanceInformation>;
  nodeObj: LayoutNode;
  validTextResourceBindings: undefined;
  validDataModelBindings: undefined;
};
