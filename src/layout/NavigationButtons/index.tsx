import React, { forwardRef } from 'react';
import type { JSX } from 'react';

import { NavigationButtonsDef } from 'src/layout/NavigationButtons/config.def.generated';
import { NavigationButtonsComponent } from 'src/layout/NavigationButtons/NavigationButtonsComponent';
import { NavigationButtonsNext } from 'src/layout/NavigationButtons/NavigationButtonsNext';
import type { PropsFromGenericComponent } from 'src/layout';
import type { CommonProps } from 'src/layout/Input';
import type { CompIntermediateExact } from 'src/layout/layout';

export class NavigationButtons extends NavigationButtonsDef {
  render = forwardRef<HTMLElement, PropsFromGenericComponent<'NavigationButtons'>>(
    function LayoutComponentNavigationButtonRender(props, _): JSX.Element | null {
      return <NavigationButtonsComponent {...props} />;
    },
  );

  renderNext(
    component: CompIntermediateExact<'NavigationButtons'>,
    commonProps: CommonProps,
  ): React.JSX.Element | null {
    return (
      <NavigationButtonsNext
        component={component}
        commonProps={commonProps}
      />
    );
  }
}
