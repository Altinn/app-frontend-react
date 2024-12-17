import React, { forwardRef, type JSX } from 'react';

import { SigningDocumentListDef } from 'src/layout/SigningDocumentList/config.def.generated';
import { SigningDocumentListComponent } from 'src/layout/SigningDocumentList/SigningDocumentListComponent';
import type { PropsFromGenericComponent } from 'src/layout';

export class SigningDocumentList extends SigningDocumentListDef {
  render = forwardRef<HTMLElement, PropsFromGenericComponent<'SigningDocumentList'>>(
    function SigningDocumentListComponentRender(props, _): JSX.Element | null {
      return <SigningDocumentListComponent {...props} />;
    },
  );
}
