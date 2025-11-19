import React, { forwardRef } from 'react';
import type { JSX } from 'react';

import { LommebokDef } from 'src/layout/Lommebok/config.def.generated';
import { LommebokComponent } from 'src/layout/Lommebok/LommebokComponent';
import type { PropsFromGenericComponent } from 'src/layout';
import type { SummaryRendererProps } from 'src/layout/LayoutComponent';
import type { Summary2Props } from 'src/layout/Summary2/SummaryComponent2/types';

export class Lommebok extends LommebokDef {
  render = forwardRef<HTMLElement, PropsFromGenericComponent<'Lommebok'>>(
    function LayoutComponentInputRender(props, _): JSX.Element | null {
      return <LommebokComponent {...props} />;
    },
  );

  renderSummary(_props: SummaryRendererProps): JSX.Element | null {
    return <h2>Not implemented</h2>;
  }

  renderSummary2(_props: Summary2Props): JSX.Element | null {
    return <h2>Not implemented</h2>;
  }
}
