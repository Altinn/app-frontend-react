import React, { forwardRef } from 'react';
import type { JSX } from 'react';

import { Summary2Def } from 'src/layout/Summary2/config.def.generated';
import { SummaryComponent2 } from 'src/layout/Summary2/SummaryComponent2/SummaryComponent2';
import type { PropsFromGenericComponent } from 'src/layout';

export class Summary2 extends Summary2Def {
  render = forwardRef<HTMLElement, PropsFromGenericComponent<'Summary2'>>(
    function LayoutComponentSummaryRender(props, _): JSX.Element | null {
      return <SummaryComponent2 summaryNode={props.node} />;
    },
  );

  renderSummary(): JSX.Element | null {
    // If the code ever ends up with a Summary component referencing another Summary component, we should not end up
    // in an infinite loop by rendering them all. This is usually stopped early in <SummaryComponent />.
    return null;
  }

  renderSummary2(): JSX.Element | null {
    // If the code ever ends up with a Summary component referencing another Summary component, we should not end up
    // in an infinite loop by rendering them all. This is usually stopped early in <SummaryComponent />.
    return null;
  }
  shouldRenderInAutomaticPDF() {
    return true;
  }
}
