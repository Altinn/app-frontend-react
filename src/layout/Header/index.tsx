import React, { forwardRef } from 'react';
import type { JSX } from 'react';

import { HeaderDef } from 'src/layout/Header/config.def.generated';
import { HeaderComponent } from 'src/layout/Header/HeaderComponent';
import type { PropsFromGenericComponent } from 'src/layout';

export class Header extends HeaderDef {
  render = forwardRef<HTMLElement, PropsFromGenericComponent<'Header'>>(
    function LayoutComponentHeaderRender(props, _): JSX.Element | null {
      return <HeaderComponent {...props} />;
    },
  );

  // renderSummary2(summaryNode: LayoutNode<'Header'>): JSX.Element | null {
  //   const containerDivRef = React.useRef<HTMLDivElement | null>(null);
  //   return (
  //     <HeaderComponent
  //       containerDivRef={containerDivRef}
  //       node={summaryNode}
  //     />
  //   );
  // }
}
