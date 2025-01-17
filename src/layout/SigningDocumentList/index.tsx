import { forwardRef, type JSX } from 'react';
import React from 'react';

import { SigningDocumentListDef } from 'src/layout/SigningDocumentList/config.def.generated';
import { SigningDocumentListComponent } from 'src/layout/SigningDocumentList/SigningDocumentListComponent';
import { SigningDocumentListSummary } from 'src/layout/SigningDocumentList/SigningDocumentListSummary';
import type { PropsFromGenericComponent } from 'src/layout';
import type { Summary2Props } from 'src/layout/Summary2/SummaryComponent2/types';

export class SigningDocumentList extends SigningDocumentListDef {
  render = forwardRef<HTMLElement, PropsFromGenericComponent<'SigningDocumentList'>>(
    function SigningDocumentListComponentRender(props, _): JSX.Element | null {
      return <SigningDocumentListComponent {...props} />;
    },
  );

  renderSummary2(props: Summary2Props<'SigningDocumentList'>): JSX.Element | null {
    return <SigningDocumentListSummary componentNode={props.target} />;
  }
}
