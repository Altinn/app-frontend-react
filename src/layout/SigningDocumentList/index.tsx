import { forwardRef, type JSX } from 'react';
import React from 'react';

import { SigningDocumentListDef } from 'src/layout/SigningDocumentList/config.def.generated';
import { SigningDocumentListComponent } from 'src/layout/SigningDocumentList/SigningDocumentListComponent';
import { useNodeItem } from 'src/utils/layout/useNodeItem';
import type { PropsFromGenericComponent } from 'src/layout';
import type { Summary2Props } from 'src/layout/Summary2/SummaryComponent2/types';

export class SigningDocumentList extends SigningDocumentListDef {
  render = forwardRef<HTMLElement, PropsFromGenericComponent<'SigningDocumentList'>>(
    function SigningDocumentListComponentRender(props, _): JSX.Element | null {
      const textResourceBindings = useNodeItem(props.node, (i) => i.textResourceBindings);
      return <SigningDocumentListComponent textResourceBindings={textResourceBindings} />;
    },
  );

  renderSummary2(props: Summary2Props<'SigningDocumentList'>): JSX.Element | null {
    const textResourceBindings = useNodeItem(props.target, (i) => i.textResourceBindings);
    return (
      <SigningDocumentListComponent
        textResourceBindings={{
          ...textResourceBindings,
          title: textResourceBindings?.summary_title ?? 'signing_document_list_summary.header',
        }}
      />
    );
  }
}
