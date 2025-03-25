import React, { forwardRef } from 'react';
import type { JSX } from 'react';

import { NavigationBarDef } from 'src/layout/NavigationBar/config.def.generated';
import { NavigationBarComponent } from 'src/layout/NavigationBar/NavigationBarComponent';
import type { PropsFromGenericComponent } from 'src/layout';
import type { CommonProps } from 'src/layout/Input';
import type { CompIntermediateExact } from 'src/layout/layout';

export class NavigationBar extends NavigationBarDef {
  render = forwardRef<HTMLElement, PropsFromGenericComponent<'NavigationBar'>>(
    function LayoutComponentNavigationBarRender(props, _): JSX.Element | null {
      return <NavigationBarComponent {...props} />;
    },
  );

  renderNext(props: CompIntermediateExact<'NavigationBar'>, commonProps: CommonProps): React.JSX.Element | null {
    return <div>{JSON.stringify(props, null, 2)}</div>;
  }
}
