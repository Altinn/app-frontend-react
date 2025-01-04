import React, { forwardRef } from 'react';
import type { JSX } from 'react';

import { SigningStatusPanelDef } from 'src/layout/SigningStatusPanel/config.def.generated';
import { SigningStatusPanelComponent } from 'src/layout/SigningStatusPanel/SigningStatusPanelComponent';
import type { PropsFromGenericComponent } from 'src/layout';

export class SigningStatusPanel extends SigningStatusPanelDef {
  render = forwardRef<HTMLElement, PropsFromGenericComponent<'SigningStatusPanel'>>(
    function SigningStatusPanelComponentRender(props, _): JSX.Element | null {
      return <SigningStatusPanelComponent {...props} />;
    },
  );
}
