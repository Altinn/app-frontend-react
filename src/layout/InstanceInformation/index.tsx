import React, { forwardRef } from 'react';

import { InstanceInformationDef } from 'src/layout/InstanceInformation/config.def.generated';
import { InstanceInformationComponent } from 'src/layout/InstanceInformation/InstanceInformationComponent';
import type { PropsFromGenericComponent } from 'src/layout';
import type { ExprResolver } from 'src/layout/LayoutComponent';

export class InstanceInformation extends InstanceInformationDef {
  render = forwardRef<HTMLElement, PropsFromGenericComponent<'InstanceInformation'>>(
    function LayoutComponentInstanceInformationRender(props, _): JSX.Element | null {
      return <InstanceInformationComponent {...props} />;
    },
  );

  evalExpressions({ item, evalTrb, evalCommon }: ExprResolver<'InstanceInformation'>) {
    return {
      ...item,
      ...evalCommon(),
      ...evalTrb(),
    };
  }
}
